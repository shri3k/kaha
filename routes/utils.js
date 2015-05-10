var conf = require('../config/');
var sha = require('object-hash');
var uuid = require('node-uuid');
var _ = require('underscore');
_.mixin(require('underscore.deep'));
var url = require('url');
var db;
var env = exports.env = conf.name;
var similarFilter = ['type', 'location', 'description.contactnumber'];
var readonly = exports.readonly = Number(process.env.KAHA_READONLY) || 0;

exports.init = function(dbObj){
  db = dbObj;
};

/**
 * Description: mixin for increment
 *    and decrement counter
 *
 * @method flagcounter
 * @param dbQry{Function} query to be performed
 * @return Function
*/
var flagcounter = exports.flagcounter = function(dbQry) {
  return function(req, res, next) {
    if (enforceReadonly(res)) {
      return;
    }
    var obj = {
      "uuid": req.params.id,
      "flag": req.query.flag
    };
    dbQry(req, res, obj);
  };
};

/**
 * Description: When the server
 *    needs to enable read-only
 *    mode to stop writing on db
 *
 * @method enforceReadonly
 * @param res{Object}
 * @return Boolean
*/
var enforceReadonly = exports.enforceReadonly = function(res) {
  if (readonly) {
    res.status(503).send('Service Unavailable');
    return true;
  }
  return false;
};

/**
 * Description: Standard Callback
 *    To stop duplication across
 *    all page
 *
 * @method stdCb
 * @param err{Boolean}, reply{Array}
 * @return  [Boolean]
 */
var stdCb = exports.stdCb = function(err, reply) {
  if (err) {
    return err;
  }
};
/**
 * Description: Get Everything
 *
 * @method getAllFromDb
 * @param  Function
 * @return  N/A
 */
exports.getEverything = function(cb) {
  var results = [];
  var multi = db.multi();
  db.keys('*', function(err, reply) {
    if (err) {
      return err;
    }
    reply.forEach(function(key) {
      multi.get(key, stdCb);
    });
    multi.exec(function(err, replies) {
      if (err) {
        return err;
      }
      var result = _.map(replies, function(rep) {
        return JSON.parse(rep);
      });
      var keyVals = _.object(reply, result);
      cb(null, keyVals);
    });
  });
};

/**
 * Description: DRYing
 *
 * @method getAllFromDb
 * @param cb{Function}
 * @return n/a
*/
var getAllFromDb = exports.getAllFromDb = function(cb) {
  var results = [];
  var multi = db.multi();
  db.keys('*', function(err, reply) {
    if (err) {
      return err;
    }
    db.keys('*:*', function(err, reply2) {
      if (err) {
        return err;
      }
      _.each(_.difference(reply, reply2), function(key) {
        multi.get(key, stdCb);
      });
      multi.exec(function(err, replies) {
        if (err) {
          return err;
        }
        var result = _.map(replies, function(rep) {
          return JSON.parse(rep);
        });
        cb(null, result);
      });
    });
  });
};

/**
 * Description: Only for individual
 *  Object
 *
 * @method getSha
 * @param obj{Object}, shaFilters{Array}
 * @return  String
 */
var getSha = exports.getSha = function(obj, shaFilters) {
  var key, extract = {};
  if (Array.isArray(shaFilters)) {
    shaFilters.forEach(function(filter) {
      var selectedObj = _.deepPick(obj, [filter]);
      _.extend(extract, selectedObj);
    });
  }
  return sha(extract);
};

/**
 * Description: Similar to getSha
 *    but for array of Objects
 *
 * @method getShaAllWithObjs
 * @param objs{Object}
 * @return Array
*/
var getShaAllWithObjs = exports.getShaAllWithObjs = function(objs) {
  var hashes = [];
  objs.forEach(function(result) {
    var tmpObj = {};
    tmpObj[getSha(result, similarFilter)] = result;
    hashes.push(tmpObj);
  });
  return hashes;
};

/**
 * Description: No filter
 *
 * @method  methodName
 * @param  type
 * @return  type
*/
var getShaAll = exports.getShaAll = function(objs, similarFilter) {
  var hashes = [];
  objs.forEach(function(result) {
    hashes.push(getSha(result, similarFilter));
  });
  return hashes;
};

/**
 * Description:
 *
 * @method  methodName
 * @param  type
 * @return  type
*/
var getSimilarItems = exports.getSimilarItems = function(arrayObj, shaKey) {
  return _.map(_.filter(getShaAllWithObjs(arrayObj), function(obj) {
    return _.keys(obj)[0] === shaKey;
  }), function(obj) {
    return _.values(obj)[0];
  });
};

var getUniqueUserID = exports.getUniqueUserID = function(req) {
  var proxies = req.headers['x-forwarded-for'] || '';
  var ip = _.last(proxies.split(',')) ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return ip;
};

/**
 * Description: Does single or bulk post
 *
 * @method rootPost
 * @param req(Object), res(Object), next(Function)
 * @return n/a
*/
var rootPost = exports.rootPost = function(req, res, next) {
  /* give each entry a unique id
   */
  function entry(obj) {
    var data_uuid = uuid.v4();
    obj.uuid = data_uuid;
    obj = dateEntry(obj);
    if (typeof obj.verified === 'undefined') {
      obj.verified = false;
    }

    multi.set(data_uuid, JSON.stringify(obj), function(err, reply) {
      if (err) {
        return err;
      }
      return reply;
    });
  }

  function dateEntry(obj) {
    var today = new Date();
    if (!(obj.date && obj.date.created)) {
      obj.date = {
        'created': today.toUTCString(),
        'modified': today.toUTCString()
      };
    }
    return obj;
  }

  function insertToDb(res) {
      multi.exec(function(err, replies) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
          return;
        }
        //console.log(JSON.stringify(replies));
        if (replies) {
          res.send(replies);
        }
      });
    }

  if (enforceReadonly(res)) {
    return;
  }

  var ref = (req.headers && req.headers.referer) || false;
  //No POST request allowed from other sources
  //TODO probably need to fix this for prod docker
  if (ref) {
    var u = url.parse(ref);
    var hostname = u && u.hostname.toLowerCase();
    var environment = env.toLowerCase();
    if (hostname === "kaha.co" ||
      hostname === "demokaha.herokuapp.com" ||
      environment === "stage" ||
      environment === "dev"
    ) {
      var okResult = [];
      var multi = db.multi();

      var data = req.body;
      if (Array.isArray(data)) {
        data.forEach(function(item, index) {
          entry(item);
          insertToDb(res);
        });
      } else {
        getAllFromDb(function(err, results) {
          var similarItems = getSimilarItems(results, getSha(data, similarFilter));
          var query = req.query.confirm || "no";
          if (similarItems.length > 0 && (query.toLowerCase() === "no")) {
            res.send(similarItems);
          } else {
            entry(data);
            insertToDb(res);
          }
        });
      }
    } else {
      res.status(403).send('Invalid Origin');
    }
  } else {
    res.status(403).send('Invalid Origin');
  }
};
