// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var messages_pb = require('./messages_pb.js');
var google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
var shared_pb = require('./shared_pb.js');

function serialize_fontbakery_dashboard_CacheItem(arg) {
  if (!(arg instanceof messages_pb.CacheItem)) {
    throw new Error('Expected argument of type fontbakery.dashboard.CacheItem');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_CacheItem(buffer_arg) {
  return messages_pb.CacheItem.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_CacheKey(arg) {
  if (!(arg instanceof messages_pb.CacheKey)) {
    throw new Error('Expected argument of type fontbakery.dashboard.CacheKey');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_CacheKey(buffer_arg) {
  return messages_pb.CacheKey.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_CacheStatus(arg) {
  if (!(arg instanceof messages_pb.CacheStatus)) {
    throw new Error('Expected argument of type fontbakery.dashboard.CacheStatus');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_CacheStatus(buffer_arg) {
  return messages_pb.CacheStatus.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_PokeRequest(arg) {
  if (!(arg instanceof messages_pb.PokeRequest)) {
    throw new Error('Expected argument of type fontbakery.dashboard.PokeRequest');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_PokeRequest(buffer_arg) {
  return messages_pb.PokeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_Report(arg) {
  if (!(arg instanceof messages_pb.Report)) {
    throw new Error('Expected argument of type fontbakery.dashboard.Report');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_Report(buffer_arg) {
  return messages_pb.Report.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_ReportIds(arg) {
  if (!(arg instanceof messages_pb.ReportIds)) {
    throw new Error('Expected argument of type fontbakery.dashboard.ReportIds');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_ReportIds(buffer_arg) {
  return messages_pb.ReportIds.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_fontbakery_dashboard_ReportsQuery(arg) {
  if (!(arg instanceof messages_pb.ReportsQuery)) {
    throw new Error('Expected argument of type fontbakery.dashboard.ReportsQuery');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_fontbakery_dashboard_ReportsQuery(buffer_arg) {
  return messages_pb.ReportsQuery.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Any(arg) {
  if (!(arg instanceof google_protobuf_any_pb.Any)) {
    throw new Error('Expected argument of type google.protobuf.Any');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_protobuf_Any(buffer_arg) {
  return google_protobuf_any_pb.Any.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_google_protobuf_Empty(arg) {
  if (!(arg instanceof google_protobuf_empty_pb.Empty)) {
    throw new Error('Expected argument of type google.protobuf.Empty');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_google_protobuf_Empty(buffer_arg) {
  return google_protobuf_empty_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


// The Cache service
var CacheService = exports.CacheService = {
  // Sends a greeting
  put: {
    path: '/fontbakery.dashboard.Cache/Put',
    requestStream: true,
    responseStream: true,
    requestType: messages_pb.CacheItem,
    responseType: messages_pb.CacheKey,
    requestSerialize: serialize_fontbakery_dashboard_CacheItem,
    requestDeserialize: deserialize_fontbakery_dashboard_CacheItem,
    responseSerialize: serialize_fontbakery_dashboard_CacheKey,
    responseDeserialize: deserialize_fontbakery_dashboard_CacheKey,
  },
  // Sends another greeting
  get: {
    path: '/fontbakery.dashboard.Cache/Get',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.CacheKey,
    responseType: google_protobuf_any_pb.Any,
    requestSerialize: serialize_fontbakery_dashboard_CacheKey,
    requestDeserialize: deserialize_fontbakery_dashboard_CacheKey,
    responseSerialize: serialize_google_protobuf_Any,
    responseDeserialize: deserialize_google_protobuf_Any,
  },
  purge: {
    path: '/fontbakery.dashboard.Cache/Purge',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.CacheKey,
    responseType: messages_pb.CacheStatus,
    requestSerialize: serialize_fontbakery_dashboard_CacheKey,
    requestDeserialize: deserialize_fontbakery_dashboard_CacheKey,
    responseSerialize: serialize_fontbakery_dashboard_CacheStatus,
    responseDeserialize: deserialize_fontbakery_dashboard_CacheStatus,
  },
};

exports.CacheClient = grpc.makeGenericClientConstructor(CacheService);
// The Manifest service
//
var ManifestService = exports.ManifestService = {
  // FIXME: this is outdated but may have some good bits!
  // check for updates and emit a notice if since the last poke families
  // were updated
  // so if there's a change, we'll download it directly and put the files
  // ordered into a Files message. The sha256 hash is what we emit as
  // a change message ManifestKey: (manifiestid/collectionid, family name, filesHash)
  // PokeResponse, is basically nothing, just a OK message ... how to do this
  // best with grpc?
  // Maybe we could directly send this to the cache?
  // If we need to re-run an entiren Collection, because Font Bakery changed,
  // we still need the latest versions of the collection on disk.
  // so, it would be nice to have some form of atomicity between asking the
  // informing the ManifestMaster and running the tests. Therefore, we could
  // just put the entire current state into the cache and then let the
  // ManifestMaster decide which ones to keep and which ones to drop.
  // The Manifest itselt can in the meantime update itself etc.
  // I.e. We create a "Snapshot" of the manifest in the cache, then
  // we can forget about it
  poke: {
    path: '/fontbakery.dashboard.Manifest/Poke',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.PokeRequest,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_fontbakery_dashboard_PokeRequest,
    requestDeserialize: deserialize_fontbakery_dashboard_PokeRequest,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
};

exports.ManifestClient = grpc.makeGenericClientConstructor(ManifestService);
// The Reports service
//
var ReportsService = exports.ReportsService = {
  // to file the report ("file" as a verb, but by convention first letter uppercased)
  file: {
    path: '/fontbakery.dashboard.Reports/File',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.Report,
    responseType: google_protobuf_empty_pb.Empty,
    requestSerialize: serialize_fontbakery_dashboard_Report,
    requestDeserialize: deserialize_fontbakery_dashboard_Report,
    responseSerialize: serialize_google_protobuf_Empty,
    responseDeserialize: deserialize_google_protobuf_Empty,
  },
  // Get a list of reports including selection/filtering etc.
  query: {
    path: '/fontbakery.dashboard.Reports/Query',
    requestStream: false,
    responseStream: true,
    requestType: messages_pb.ReportsQuery,
    responseType: messages_pb.Report,
    requestSerialize: serialize_fontbakery_dashboard_ReportsQuery,
    requestDeserialize: deserialize_fontbakery_dashboard_ReportsQuery,
    responseSerialize: serialize_fontbakery_dashboard_Report,
    responseDeserialize: deserialize_fontbakery_dashboard_Report,
  },
  get: {
    path: '/fontbakery.dashboard.Reports/Get',
    requestStream: false,
    responseStream: true,
    requestType: messages_pb.ReportIds,
    responseType: messages_pb.Report,
    requestSerialize: serialize_fontbakery_dashboard_ReportIds,
    requestDeserialize: deserialize_fontbakery_dashboard_ReportIds,
    responseSerialize: serialize_fontbakery_dashboard_Report,
    responseDeserialize: deserialize_fontbakery_dashboard_Report,
  },
};

exports.ReportsClient = grpc.makeGenericClientConstructor(ReportsService);
// Provides interfaces to read the data, get listings/filter.
