#! /usr/bin/env node
"use strict";
// this is expected to run in nodejs
/* global require */
/* jshint esnext:true */

const { initAmqp }= require('./getSetup')
  , { CacheClient } = require('./CacheClient')
  , grpc = require('grpc')
  , messages_pb = require('protocolbuffers/messages_pb')
  , services_pb = require('protocolbuffers/messages_grpc_pb')
  , ManifestService = services_pb.ManifestService
  , timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js')
  ;

/**
 * This connects the manifestSources to the world (cluster)
 *
 * We currently run this from main within the manifestSources
 */
function ManifestServer(logging, id, sources, port, cacheSetup, amqpSetup) {
    this._log = logging;
    this._id = id;
    this._ready = false;
    this._server = new grpc.Server();
    this._server.addService(ManifestService, this);
    this._server.bind('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure());

    this._cache = new CacheClient(logging, cacheSetup.host, cacheSetup.port
                            , messages_pb, 'fontbakery.dashboard');
    this._amqp = null;
    this._manifestMasterJobQueueName = 'fontbakery-manifest-master-jobs';
    //
    // FIXME: do we need this?
    // if it's only about the POKE function, we may as well just wait for
    // incoming queues or such.
    // this._manifestMasterRegisterSourceQueueName = 'fontbakery-manifest-master-register-source';

    this._sources = Object.create(null);

    // Start serving when the database and rabbitmq queue is ready
   Promise.all([
                 initAmqp(this._log, amqpSetup)
               , this._cache.waitForReady()
               , this._addSources(sources)
               ])
    .then(resources => {
        this._amqp = resources[0];
    })
    // default on startup
    .then(()=>{
        this._ready = true;
        this._log.info('Ready now!');
    })
    .then(this.updateAll.bind(this))
    .catch(function(err) {
        this._log.error('Can\'t initialize server.', err);
        process.exit(1);
    }.bind(this))
   ;
}

var _p = ManifestServer.prototype;

_p._addSources = function(sources) {
    return Promise.all(sources.map(this._addSource, this)
                              .filter(promise=>!!promise));
};


_p._registerSource = function(sourceID) {
    // jshint unused:vars
    // PASS.
    // Discussion in the constructor at _manifestMasterRegisterSourceQueueName
    // return this._sendAMQPMessage(this._manifestMasterRegisterSourceQueueName, buffer);
};

_p._addSource = function(source) {
    if(source.id in this._sources)
        throw new Error('Source ID "' + source.id + '" already exists.');
    source.setDispatchFamily(this._dispatchFamily.bind(this, source.id));
    this._sources[source.id] = source;
    this._registerSource(source.id);
    return source.init();
};

_p.updateAll = function(force) {
    var updates = [], sourceId;
    for(sourceId in this._sources)
        updates.push(this.update(sourceId, force));
    return Promise.all(updates);
};

_p.update = function(sourceId, force) {
    return this._sources[sourceId].schedule('update', force);
};


/**
 * Manifest source? This is useful for all Manifests.
 * filesData is is an array of arrays:
 *          [ [string filename, Uint8Array fileData], ... ]
 */
_p._wrapFamilyData = function(filesData) {
    var filesMessage = new messages_pb.Files();

    // sort by file name
    function sortFilesData(a, b) {
        var nameA = a[0], nameB = b[0];
        if(nameA === nameB) return 0;
        return nameA > nameB ? 1 : -1;
    }

    function makeFile(item) {
        var file = new messages_pb.File()
          , [filename, arrBuff] = item
          ;
        file.setName(filename);
        file.setData(arrBuff);
        return file;
    }

    // this important, so that we get exact hashes from the FilesPB serialization
    filesData.sort(sortFilesData)
             .map(makeFile)
             // equals filesMessage.addFiles(file);
             .forEach(filesMessage.addFiles, filesMessage);

    return filesMessage;
};

/**
 * Manifest source? This is useful for all Manifests.
 * familyData is is an array of [string filename, messages_pb.Files filesMessage]
 */
_p._cacheFamily = function (filesMessage) {
    return this._cache.put([filesMessage])
        // only the first item is interesting/present because we only
        // put one message into: `[filesMessage]`
        .then(responses=>responses[0]); // [cacheKey] => cacheKey
};

_p._sendAMQPMessage = function (queueName, message) {
    var options = {
            // TODO: do we need persistent here/always?
            persistent: true // same as deliveryMode: true or deliveryMode: 2
        }
        ;
    function sendMessage() {
        // jshint validthis:true
        this._log.info('sendToQueue: ', queueName);
        return this._amqp.channel.sendToQueue(queueName, message, options);
    }
    return this._amqp.channel.assertQueue(queueName, {durable: true})
           .then(sendMessage.bind(this))
           ;
};

_p._dispatchFamilyJob = function(sourceid, familyName, cacheKey, metadata) {
    var collectionId = [this._id, sourceid].join('/')
      , job = new messages_pb.CollectionFamilyJob()
      , timestamp = new timestamp_pb.Timestamp()
      , buffer
      ;
    this._log.debug('_dispatchFamilyJob:', familyName, collectionId);

    job.setCollectionid(collectionId);
    job.setFamilyname(familyName);
    job.setCachekey(cacheKey);

    timestamp.fromDate(new Date());
    job.setDate(timestamp);// Timestamp => hoping that this is the way to do it
    if(metadata)
        job.setMetdata(JSON.stringify(metadata));

    buffer = new Buffer(job.serializeBinary());
    return this._sendAMQPMessage(this._manifestMasterJobQueueName, buffer);
};

_p._dispatchFamily = function(sourceid, familyName, filesData, metadata) {
    var filesMessage = this._wrapFamilyData(filesData); // => filesMessage
    return this._cacheFamily(filesMessage) // => cacheKey
                    .then(cacheKey => {
                        return this._dispatchFamilyJob(sourceid, familyName, cacheKey, metadata);
                    })
                    ;
};

// ManifestService implementation
// rpc Poke (PokeRequest) returns (GenericResponse) {};
_p.poke = function(call, callback) {
    if(!this._ready)
        callback(new Error('Not ready yet'));
    var sourceId = call.request.getSource() // call.request is a PokeRequest
      , force = call.request.getForce()
      , response = new messages_pb.GenericResponse()
      , err = null
      ;

    if(sourceId !== '') {
        if( !(sourceId in this._sources) )
            err = new Error('Not Found: The source "' + sourceId + '" is unknown.');
        else {
            this.update(sourceId, force);
            response.setOk(true);
        }
    }
    else {
        this.updateAll();
        response.setOk(true);
    }

    if(err)
        response = null;
    callback(err, response);
};


exports.ManifestServer = ManifestServer;
