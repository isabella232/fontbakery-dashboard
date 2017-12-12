#! /usr/bin/env node
"use strict";
// this is expected to run in nodejs
/* global require, module */
/* jshint esnext:true */

const { _Source } = require('./_Source')
    , Parent = _Source
    , { ManifestServer } = require('../util/ManifestServer')
    , { getSetup } = require('../util/getSetup')
    , NodeGit = require('nodegit')
    , https = require('https')
    ;

const GITHUB_HTTPS_GIT_URL = 'https://github.com/{remoteName}.git'
    , GITHUB_API_HOST = 'api.github.com'
    , GITHUB_API_PATH = '/graphql'
    ;

const GitBase = (function() {

/**
 * the sources are different implementations, but both run on the
 * same ManifestServer, because they share the google/fonts repository.
 * Thus, many git objects will be shared between both, which will make
 * us inherit a lot of gits own optimizations.
 *
 * The two sources should get initialized serially, the first one
 * (whichever it is) will load the  google/fonts:master tree
 * the second one will only see see that it is already loaded (for the
 * sake of simplicity probably even call git fetch, but without any download
 * action following).
 */

function GitBase(logging, id, repoPath, baseReference, familyWhitelist) {
    this._log = logging;
    this.id = id;
    this._baseRef = {
        repoOwner: baseReference.repoOwner
      , repoName: baseReference.repoName
        // e.g. "google/fonts"
      , remoteName: [baseReference.repoOwner, baseReference.repoName].join('/')
      , name: baseReference.name
    };
    this._familyWhitelist = familyWhitelist;

    this._licenseDirs = new Set(['apache', 'ofl', 'ufl']);
    this._repoPath = repoPath;
    this._repo = null;

    Parent.call(this);
}

var _p = GitBase.prototype = Object.create(Parent.prototype);

_p._initRepo = function() {
    // doesn't fail if the repository exists already
    // returns the repository
    var isBare = 1; // == true but must be a number
    return NodeGit.Repository.init(this._repoPath, isBare);
};

// remoteName = resourcePath.slice(1)
// remoteName = "google/fonts"
// remoteUrl = "https://github.com/google/fonts.git"
// referenceName = "master"
//
// remoteName = "m4rc1e/fonts"
// remoteUrl = "https://github.com/m4rc1e/fonts.git"
// referenceName = "pacifico"
_p._getRemote = function(remoteName) {
    // right now, hard-coding this to github.
    // githubResourcePath = '/google/fonts'
    // remoteName = github.resourcePath.slice(1)
    // var remoteUrl = ['git@github.com:', remoteName, '.git'].join('');
    // Use https for now, it is easier because it doesn't need ssh credentials!
    var remoteUrl = GITHUB_HTTPS_GIT_URL.replace('{remoteName}', remoteName);
    NodeGit.Remote.create(this._repo, remoteName, remoteUrl).then(null, err => {
        if(err.errno === NodeGit.Error.CODE.EEXISTS)
            // NOTE: the remote returned by Repository.getRemote has
            // a reference to the repository:
            // remote.repo, while the remote created using NodeGit.Remote.create
            // doesn't have that reference.
            // in both cases remote.owner() returns a repository, but these
            // are not the same instance as this._repo;
            return this._repo.getRemote(remoteName);
        throw err;
    });
};

_p._getRef = function(remoteName, referenceName) {
    // use _fetchRef to also update the ref
    var fullReferenceName = [remoteName, referenceName].join('/'); // m4rc1e/fonts/pacifico ???
    return this._repo.getReference(fullReferenceName);
};

_p._fetchRef = function(remoteName, referenceName) {
    return this._getRemote(remoteName)
        .then(remote => {
           this._log.info('Started fetching remote "'
                                + remoteName + ':' + referenceName + '"');
            // this may take a while!
            // E.g. initially fetching google/fonts:master
            // also, it kind of fails silently if there's no referenceName
            // at remote. Thus, later is checked if we can get the actual
            // reference from the repo.
           return remote.fetch(referenceName);
        })
        .then(() => this._getRef(remoteName, referenceName))
        .then(ref => {
            // this does not mean the remote reference exists now
            this._log.info('Finished fetching remote "'
                                + remoteName + ':' + referenceName + '"');
            return ref;
        }, err => {
            if(err.errno === NodeGit.Error.CODE.ENOTFOUND)
            // message: no reference found for shorthand '{fullReferenceName}'
            // errno: -3
                this._log.error('FAILED: Fetching remote "'
                                + remoteName + ':' + referenceName + '"');
            throw err;
        });
};

_p.fetchBaseRef = function() {
    return this._fetchRef(this._baseRef.remoteName, this._baseRef.name);
};

// this is a *good to know how* interface, we don't actually use it
// but it is good for debugging
_p._getOidType = function(oid) {
    // returns http://www.nodegit.org/api/object/#TYPE
    // NodeGit.Object.TYPE.ANY       -2
    // NodeGit.Object.TYPE.BAD       -1
    // NodeGit.Object.TYPE.EXT1       0
    // NodeGit.Object.TYPE.COMMIT     1
    // NodeGit.Object.TYPE.TREE       2
    // NodeGit.Object.TYPE.BLOB       3
    // NodeGit.Object.TYPE.TAG        4
    // NodeGit.Object.TYPE.EXT2       5
    // NodeGit.Object.TYPE.OFS_DELTA  6
    // NodeGit.Object.TYPE.REF_DELTA  7
    this._repo.odb()
        .then(odb=>odb.read(oid))
        .then(odbObject => odbObject.type())
        ;
};

_p._getReferencedType = function(reference) {
    return this._getOidType(reference.target());
};

_p._getCommit = function(reference) {
    return NodeGit.Commit.lookup(this._repo, reference.target())
        .then(null, err => {
            // if reference target is something else
            // message the requested type does not match the type in ODB
            // errno: -3 }
            this._log.error(err);
            throw err;
        });
};


function _getChildDirPaths(tree) {
    // returns the full path of direct child directories
    // ['ofl/abeezee', 'ofl/abel','ofl/abhayalibre', ... ]
    return tree.entries()
        .filter(treeEntry => treeEntry.type() === NodeGit.Object.TYPE.TREE)
        .map(entry=>entry.path())
        ;
}

function _arrayFlatten(arrayOfArrays) {
    const reducer = (flat, item) => {
        Array.prototype.push.apply(flat, item);
        return flat;
    };
    return arrayOfArrays.reduce(reducer, []);
}

_p._getRootTreeFamilies = function(commit) {
    commit.getTree()
          .then(tree => {
            let treeFamiliesPromises = [];
            for(let licensDir of this._licenseDirs) {
                // the underscore version returns Null if entry is not found
                // it's in the official api docs. But we can't use it further.
                // tree.entryByName(licensDir) would throw however.
                if(!tree._entryByName(licensDir))
                    // not found
                    continue;
                let treeEntry = tree.entryByName(licensDir);
                treeFamiliesPromises.push(treeEntry.getTree().then(_getChildDirPaths));
            }
            return Promise.all(treeFamiliesPromises).then(_arrayFlatten);
        });
};

_p._dirsToCheckFromDiff = function (newTree, changedNamesDiff ) {
    let fileNames = changedNamesDiff.split('\n')
      , seen = new Set()
      , dirsToCheck = []
      ;
    for(let fileName of fileNames) {
        if(!fileName.length)
            // last line is empty, only case afaik
            continue;
        let parts = fileName.split('/');
        if(!this._licenseDirs.has(parts[0]) || parts.length < 2)
            continue;
        // 3 parts is the usual, e.g: ['ofl', 'abbeezee', 'Abeezee-Regular.ttf']
        let familyDir = parts.slice(0, 2).join('/');
        if(seen.has(familyDir))
            continue;
        seen.add(familyDir);
        // this is the last filter to see if familyDir is actually
        // in newTree. Afaik, changedNamesDiff also contains removed
        // names. This should be very solid.
        dirsToCheck.push(newTree.getEntry(familyDir)
                                // err is if family dir is not found
                                // which is OK at this point (see above)
                                .then(treeEntry=>treeEntry.path(), () => null));
    }
    return Promise.all(dirsToCheck)
            //some are null, if they have been removed in newTree
            .then(dirs => dirs.filter(entry =>!!entry))
            ;
};

// returns a list of family directories that differ
_p._dirsToCheck = function(oldTree, newTree) {
    let diffOptions = new NodeGit.DiffOptions();
    return NodeGit.Diff.treeToTree(this._repo, oldTree, newTree, diffOptions)
        .then(diff => diff.toBuf(NodeGit.Diff.FORMAT.NAME_ONLY))
        // changedNamesDiff is a string not a buffer
        // if that ever changes:
        //       dirsToCheck(newTree, changedNamesDiff.toString())
        .then(changedNamesDiff => this._dirsToCheckFromDiff(newTree, changedNamesDiff))
        ;
};


const _FAMILY_WEIGHT_REGEX = /([^/-]+)-(\w+)\.ttf$/;
function familyNameFromFilename(filename) {
  /**
   * Ported partially from Python gftools.util.google_fonts.FileFamilyStyleWeight
   * https://github.com/googlefonts/tools/blob/master/Lib/gftools/util/google_fonts.py#L449
   *
   * If style and weight is needed it's worth porting the whole function.
   *
   * > familyNameFromFilename('LibreBarcode39ExtendedText-Regular.ttf')
   * 'Libre Barcode 39 Extended Text'
   */

  var m = filename.match(_FAMILY_WEIGHT_REGEX);
  if(!m)
    throw Error('Could not parse ' + filename);
  return familyName(m[1]);
}

function familyName(fontname) {
  /**
   * Ported from Python gftools.util.google_fonts.FamilyName
   * https://github.com/googlefonts/tools/blob/master/Lib/gftools/util/google_fonts.py#L417
   *
   * Attempts to build family name from font name.
   * For example, HPSimplifiedSans => HP Simplified Sans.
   * Args:
   *   fontname: The name of a font.
   * Returns:
   *   The name of the family that should be in this font.
   */
  // SomethingUpper => Something Upper
  fontname = fontname.replace(/(.)([A-Z][a-z]+)/g, '$1 $2');
  // Font3 => Font 3
  fontname = fontname.replace(/([a-z])([0-9]+)/g, '$1 $2');
  // lookHere => look Here
  return fontname.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

_p._updateTreeEntry = function(treeEntry, metadata) {
    function treeEntryToFileData(treeEntry) {
        return treeEntry.getBlob()
                .then(blob => new Uint8Array(blob.content().buffer))
                .then(data => [treeEntry.name(), data])
                ;
    }

    function treeToFilesData(tree) {
        let fileEntries = tree.entries()
                              .filter(te=>te.isFile())
                              .map(treeEntryToFileData);
        return Promise.all(fileEntries);
    }

    let dispatchFilesData = (filesData) => {
        let familyName = null;
        for(let fileData of filesData) {
            let fileName = fileData[0];
            if(fileName.slice(-4) === '.ttf') {
                familyName = familyNameFromFilename(fileName);
                break;
            }
        }
        if(!familyName)
            throw new Error('Can\'t determine family name from files in '
                                + 'directory "' + treeEntry.path() + '".');

        if(this._familyWhitelist && !this._familyWhitelist.has(familyName))
            return null;

        return this._dispatchFamily(familyName, filesData, metadata);
    };
    return treeEntry.getTree()
                    .then(treeToFilesData)
                    .then(dispatchFilesData)
                    ;
};

this.init = function() {
    return this._repo
            ? Promise.resolve(this._repo)
            : this._initRepo.then(
                  repo => this._repo = repo
                , err => {
                    this._log.error('Can\'t init git reporsitory: ', err);
                    throw err;
                  }
              )
            ;
};

return GitBase;
})();

const GitBranch = (function() {

// google/fonts:master -> monitored branch
//            -> checks differences between last check and current
//              `if families in the branch changed`
//            -> to check if there was an actual change, we
//               keep the last checked tree-id for each font family directory
// uses one old_tree and a "list" of one "new_trees"
// "old_tree" => tree of last checked commit.
//               if no old_tree is available, we check
//               the full collection, i.e. the tree of the current commit.
// "new_tree" => current google/fonts/master
function GitBranch(logging, id, repoPath, baseReference, familyWhitelist) {
    GitBase.call(this, logging, id, repoPath, baseReference, familyWhitelist);
    this._lastChecked = new Map();
    this._oldCommit = null;
}

var _p = GitBranch.prototype = Object.create(GitBase.prototype);

/**
 * if there is no state information about the last update,
 * all of the fonts must be dispatched
 * if there is state information about the last update
 * dispatch only fonts with another tree object id than the state knows
 * don't fetch files in subdirectories, we want a flat dir here
 * besides, at the moment, fontbakery-worker rejects sub directories
 */
_p._update = function(forceUpdate, currentCommit) {
    let currentCommitTreePromise = currentCommit.getTree()
      , dirsPromise = this._oldCommit
            // based on diff
            ? Promise.all([this._oldCommit.getTree(), currentCommitTreePromise])
                     .then(([oldTree, newTree]) => this._dirsToCheck(oldTree, newTree))
            // all families
            : this._getRootTreeFamilies(currentCommit)
      ;
    this._oldCommit = currentCommit;
    Promise.all([currentCommitTreePromise, dirsPromise])
    .then(([currentCommitTree, dirs]) => {
        return Promise.all(dirs.map(dir=>currentCommitTree.getEntry(dir)));
    })
    .then(treeEntries => {
        let promises = [];
        for(let treeEntry of treeEntries) {
            if(!forceUpdate && this._lastChecked.get(treeEntry.path()) === treeEntry.oid())
                // needs no update
                continue;
            this._lastChecked.set(treeEntry.path(), treeEntry.oid());
            let metadata = {
                commit: currentCommit.sha()
              , commitDate: currentCommit.date()
              , familyTree: treeEntry.sha()
              , familyPath: treeEntry.path()
              , repository: this._baseRef.remoteName
              , branch: this._baseRef.name
            };
            promises.push(this._updateTreeEntry(treeEntry, metadata));
        }
        // some will resolve to null if there's a hit in this._familyWhitelist
        // though, at this point, error reporting may be the only thing left to
        // do.
        return Promise.all(promises);
    });
};

// Runs immediately on init. Then it's called via the poke interface.
// There's no scheduling in the ManifestSource itself.
_p.update = function(forceUpdate) {
    // update the baseRef => can take really long the first time
    return this.fetchBaseRef()
        .then(reference => this._getCommit(reference))
        .then(currentCommit => this._update(forceUpdate, currentCommit))
        ;
};

return GitBranch;
})();




const GitBranchGithubPRs = (function() {

//     google/fonts:master/pull-requests -> via github api!
//              -> fetches PRs from github for the monitored branch
//              -> so this is ONLY PRs to master (===baseRefName)
//              -> and also uses only the latest commit that is
//                           adressed to master.
//             uses one "old_tree" and many "new_trees"
//             old_tree => current google/fonts/master (baseRefName)

function GitBranchGithubPRs(logging, id, repoPath, baseReference
                                    , gitHubAPIToken, familyWhitelist) {
    GitBase.call(this, logging, id, repoPath, baseReference, familyWhitelist);
    this._lastChecked = new Map();
}


var _p = GitBranchGithubPRs.prototype = Object.create(GitBase.prototype);

const QUERY = `
query($repoOwner: String!, $repoName: String!, $baseRefName: String, $cursor: String )
{
  repository(owner: $repoOwner, name: $repoName) {
    nameWithOwner
    homepageUrl
    pullRequests(
          first: 45, states: OPEN
        , baseRefName: $baseRefName
        , after: $cursor
        , orderBy: {field: CREATED_AT, direction: DESC}
    ) {
      totalCount
      pageInfo {
        endCursor
      }
      nodes {
        id
        url
        createdAt
        updatedAt
        baseRefName
        resourcePath
        title
        mergeable
        headRefName
        headRepository {
          nameWithOwner
        }
      }
    }
  }
}`;

_p._makeGrapQlQueryBody = function(cursor) {
    return JSON.stringify({
        query: QUERY
      , variables: {
              repoOwner: this._baseRef.repoOwner
            , repoName: this._baseRef.repoName
            , baseRefName: this._baseRef.name // only fetch PRs to baseRefName
              // when in the responese endCursor === null all items have been fetched!
              // when here cursor === null: fetches the beginning of the list
            , cursor:  cursor || null // data.repository.pullRequests.pageInfo.endCursor
        }
    });
};

_p._sendRequest = function(cursor) {
    var body = this._makeGrapQlQueryBody(cursor)
      , options = {
            hostname: GITHUB_API_HOST
          , path: GITHUB_API_PATH
          , method: 'POST'
          , port: 443
          , headers: {
                'Content-Type': 'application/json'
              , 'Content-Length': body.length
              , Authorization: 'bearer ' + this._gitHubAPIToken
              , 'User-Agent': 'Font Bakery: GitHub GraphQL Client'
           }
        }
      ;

    function onResult(resolve, reject, res) {
        var data = [ ];
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            data.push(chunk);
        });
        res.on('end', function() {
            try {
                resolve(JSON.parse(data.join('')));
            }
            catch(err) {
                reject(err);
            }
        });
        res.on('error', reject);
    }

    return new Promise(function(resolve, reject) {
        var req = https.request(options, onResult.bind(null, resolve, reject));
        req.on('error', reject);
        req.write(body);
        req.end();
    });
};

_p._queryPullRequestsData = function() {
    var prs = null
      , recursiveFetch = data_ => {
        var data = data_.data
          , pullRequests = data.repository.pullRequests
          , cursor = data.repository.pullRequests.pageInfo.endCursor
          ;
        if(prs === null)
            prs = pullRequests.nodes;
        else
            Array.prototype.push.apply(prs, pullRequests.nodes);

        if(cursor !== null)
            return this._sendRequest(cursor).then(recursiveFetch);
        else {
            if(prs.length !== data.repository.pullRequests.totalCount)
                // This assertion should hold because it is documented
                // in the API, but it is no hard reason to fail.
                this._log.warning('Assertion failed: expected totalCount ('
                                + data.repository.pullRequests.totalCount+') '
                                + 'PullRequest items, but got ' + prs.length);
            return prs;// next step
        }
    };
    return this._sendRequest(null).then(recursiveFetch);
};

_p._getReferenceResources = function(reference) {
    var result = {
        reference: reference
      , commit: null
      , commitTree: null
    };

    return this._getCommit(reference)
        .then(commit => {
            result.commit = commit;
            return commit.getTree();
        })
        .then(commitTree => {
            result.commitTree = commitTree;
        })
        .then(() => result)
        ;
};

/**
 * prData = [{
 *     "id": "MDExOlB1bGxSZXF1ZXN0MTU3MjIyNTc3",
 *     "url": "https://github.com/google/fonts/pull/1385",
 *     "createdAt": "2017-12-08T11:34:02Z",
 *     "updatedAt": "2017-12-08T12:24:06Z",
 *     "baseRefName": "master",
 *     "resourcePath": "/google/fonts/pull/1385",
 *     "title": "nunito: v3.500 added",
 *     "mergeable": "MERGEABLE",
 *     "headRefName": "nunito",
 *     "headRepository": {
 *         "nameWithOwner": "m4rc1e/fonts"
 * }]
 */
_p._fetchPullRequests = function(prsData) {
    return Promise.all(prsData.map(prData => {
        return this._fetchRef(
            prData.headRepository.nameWithOwner
          , prData.headRefName
        )
        .then(reference => this._getReferenceResources(reference))
        .then(referenceResources => ({
            data: prData
          , reference: referenceResources.reference
          , commit: referenceResources.commit
          , commitTree: referenceResources.commitTree
        }));
    }));
};

_p._getPullRequests = function() {
    return this._queryPullRequestsData
        .then(this._fetchPullRequests);
};

_p._getBaseResources = function() {
    return this.fetchBaseRef()
               .then(reference => this._getReferenceResources(reference));
};

// see _fetchPullRequests for pr data format
// prsData => [{data: prData, reference: reference, commit: commit, commitTree:commitTree}]
_p._getPRchangedFamilies = function([baseData, prsData]) {
    return Promise.all(prsData.map(prData => {
        var oldTree = baseData.commitTree
          , newTree = prData.commitTree
          ;
          return this._dirsToCheck(oldTree, newTree)
                .then(changedFamilies => {
                    prData.changedFamilies = changedFamilies;
                });
    })).then(prsData => {
        let checkFamilies = new Map();
        // only do the "latest" commit for each family.
        // prsData is still ordered by {field: CREATED_AT, direction: DESC}
        // from the original github graphQL query.
        for(let i=0,l=prsData.length;i<l;i++) {
            let changedFamilies = prsData[i].changedFamilies;
            for(let j=0,ll=changedFamilies.length;j<ll;j++) {
                let family = changedFamilies[j];
                if(checkFamilies.has(family))
                    continue;
                checkFamilies.set(family, prsData[i]);
            }
        }
        return checkFamilies;
    });
};

_p._update = function(forceUpdate, checkFamilies) {
    var promises = [];
    checkFamilies.forEach((prData, dir) => {
        let promise = prData.commitTree.getEntry(dir)
            .then(treeEntry => {
                if(!forceUpdate && this._lastChecked.get(treeEntry.path())
                                                        === treeEntry.oid())
                    // needs no update
                    return null;
                this._lastChecked.set(treeEntry.path(), treeEntry.oid());
                let metadata = {
                        commit: prData.commit.sha()
                      , commitDate: prData.commit.date()
                      , familyTree: treeEntry.sha()
                      , familyPath: treeEntry.path()
                      , repository: prData.data.headRepository.nameWithOwner
                      , branch: prData.data.headRefName
                      , prUrl: prData.url
                      , prTitle: prData.title
                };
                return this._updateTreeEntry(treeEntry, metadata);
            });
        promises.push(promise);
    });
    // some will resolve to null if there's a hit in this._familyWhitelist
    // or this._lastChecked though, at this point, error reporting may be
    // the only thing left to do.
    return Promise.all(promises);
};

/**
 * check all the diffs and collect affected font families.
 * if a font family is affected by many PRs, the youngest PR is chosen
 * i.e. skip families that have been looked at before in this run
 * mark the font-family version for the next run, could use all file-object
 * ids, as that won't even change between rebasing. still, it is probably
 * to just use the HEAD commit as mark.
 */
_p.update = function(forceUpdate) {
    // update the baseRef => can take really long the first time
    return Promise.all([
            this._getBaseResources()
          , this._getPullRequests()
        ])
       .then(this._getPRchangedFamilies.bind(this))
       .then(checkFamilies => this._update(forceUpdate, checkFamilies))
       ;
};

return GitBranchGithubPRs;
})();


if (typeof require != 'undefined' && require.main==module) {

    var setup = getSetup(), sources = [], server
       , repoPath = '/var/fontsgit'
       , familyWhitelist = null
       , grpcPort=50051
       ;

    for(let i=0,l=process.argv.length;i<l;i++) {
        if(process.argv[i] === '-p' && i+1<l) {
            let foundPort = parseInt(process.argv[i+1], 10);
            if(foundPort >= 0) // not NaN or negative
                grpcPort = foundPort;
            break;
        }
    }

    if(!process.env.GITHUB_API_TOKEN)
        // see: Using Secrets as Environment Variables
        // in:  https://kubernetes.io/docs/concepts/configuration/secret/#using-secrets-as-environment-variables
        // and: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure
        // $ kubectl -n $NAMESPACE create secret generic external-resources --from-literal=github-api-token=$GITHUB_API_TOKEN
        throw new Error('MISSING: process.env.GITHUB_API_TOKEN');

    setup.logging.log('Loglevel', setup.logging.loglevel);

    if(process.env.DEVEL_FAMILY_WHITELIST) {
        familyWhitelist = new Set(JSON.parse(process.env.DEVEL_FAMILY_WHITELIST));
        if(!familyWhitelist.size)
            familyWhitelist = null;
        setup.logging.debug('FAMILY_WHITELIST:', familyWhitelist);
    }

    var baseReference = {
            repoOwner: 'google'
          , repoName: 'fonts'
          , name: 'master'
    };

    sources.push(new GitBranch(
            setup.logging, 'master', repoPath, baseReference, familyWhitelist
    ));
    sources.push(new GitBranchGithubPRs(
            setup.logging, 'pulls', repoPath, baseReference
          , process.env.GITHUB_API_TOKEN, familyWhitelist
    ));

    var server = null;

    // an initial fetch of our repository can take a while
    // hence we do it very controlled at the beginning and get better
    // log output.
    setup.logging.info('Fetching git base reference:', baseReference);
    sources[0].init()
        .then(() => sources[0].fetchBaseRef())
        .then(() => {
            setup.logging.info('Done fetching git base reference!');
            setup.logging.info('Starting manifest server');
            server = new ManifestServer(
                setup.logging
              , 'GitHub-GoogleFonts'
              , sources
              , grpcPort
              , setup.cache
              , setup.amqp
            );
            return server.initPromise;
        }, err => {
            setup.logging.error('Can\'t fetch base reference:', err);
            process.exit(1);
        });
}
