var express = require('express');
var router = express.Router();
var redis = require('redis');
var conf = require('../config/');
var sha = require('object-hash');
var uuid = require('node-uuid');
var _ = require('underscore');
var db = redis.createClient(conf.dbport, conf.dbhost);
var dbpass = process.env.DBPWD || '';
var readonly = Number(process.env.KAHA_READONLY) || 0;
console.log('Server in read-only mode ? ' + Boolean(readonly));

_.mixin(require('underscore.deep'));
var similarFilter = ['type', 'location', 'description.contactnumber'];

function enforceReadonly(res) {
  if (readonly) {
    res.status(503).send('Service Unavailable');
    return true;
  }
  return false;
}

function stdCb(err, reply) {
  if (err) {
    return err;
  }
}


function getAllFromDb(cb) {
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
}

function getSha(obj, shaFilters) {
  var key, extract = {};
  if (Array.isArray(shaFilters)) {
    shaFilters.forEach(function(filter) {
      var selectedObj = _.deepPick(obj, [filter]);
      _.extend(extract, selectedObj);
    });
  }
  return sha(extract);
}

function getShaAllWithObjs(objs) {
  var hashes = [];
  objs.forEach(function(result) {
    var tmpObj = {};
    tmpObj[getSha(result, similarFilter)] = result;
    hashes.push(tmpObj);
  });
  return hashes;
}

function getShaAll(objs) {
  var hashes = [];
  objs.forEach(function(result) {
    hashes.push(getSha(result, similarFilter));
  });
  return hashes;
}

function getSimilarItems(arrayObj, shaKey) {
  return _.map(_.filter(getShaAllWithObjs(arrayObj), function(obj) {
    return _.keys(obj)[0] === shaKey;
  }), function(obj) {
    return _.values(obj)[0];
  });
}

db.on('connect', function() {
  console.log('Connected to the ' + conf.name + ' db: ' + conf.dbhost + ":" + conf.dbport);
});
db.auth(dbpass, function() {
  console.log("db auth success");
});

//Get core home data
router.get('/api', function(req, res, next) {
  getAllFromDb(function(err, results) {
    if (err) {
      return new Error(err);
    }
    res.send(results);
    res.end();
  });
});

//Get checksum of dupe items
router.get('/api/dupe', function(req, res, next) {
  getAllFromDb(function(err, results) {
    var hashes = getShaAll(results);
    var uniq = _.uniq(hashes);
    var objCount = _.countBy(hashes, function(item) {
      return _.contains(uniq, item) && item;
    });
    var tmpObj = {};
    _.map(objCount, function(val, key, objs) {
      if (val > 1) {
        tmpObj[key] = val;
      }
    });
    res.send(tmpObj);
  });
});

//List dupe items
router.get('/api/dupe/:sha', function(req, res, next) {
  getAllFromDb(function(err, results) {
    var similar = getSimilarItems(results, req.params.sha);
    res.send(similar);
  });
});

// Get home page
router.get('/', function(req, res, next) {
  res.render('index', {
    prod: process.env.NODE_ENV === 'prod'
  });
});

//EDIT POST
router.put('/api', function(req, res, next) {
  if (enforceReadonly(res)) {
    return;
  }
  var data = req.body;
  var data_uuid = data.uuid;
  db.get(data_uuid, function(err, reply) {
    if (err) {
      return err;
    }
    var staledate;
    var parseReply = JSON.parse(reply);
    staledate = (typeof parseReply.date !== "undefined") ? parseReply.date : {
      'created': '',
      'modified': ''
    };
    data.verified = (typeof data.verified !== "undefined") ? data.verified : false;
    data.date = staledate;
    data.date.modified = (new Date()).toUTCString();

    var yesHelp, noHelp, remove;

    db.set(data_uuid, JSON.stringify(data), function(err, reply) {
      if (err) {
        res.send('fail');
      } else {
        res.send('ok');
      }
    });

  });

});

//Add Entry
router.post('/api', function(req, res, next) {
  if (enforceReadonly(res)) {
    return;
  }

  var okResult = [];
  var multi = db.multi();

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
});

router.get('/api/:id', function(req, res, next) {
  db.get(req.params.id, function(err, reply) {
    if (err) {
      return err;
    }
    res.send(reply);
  });
});

//Edit Flags
router.get('/api/incrflag/:id', function(req, res, next) {
  if (enforceReadonly(res)) {
    return;
  }

  var uuid = req.params.id;
  var flag = req.query.flag;
  db.incr(uuid + ":" + flag, function(err, reply) {
    res.sendStatus(200);
    res.end();
  });
});

//Get Flags
router.get('/api/flags/:id', function(req, res, next) {
  var uuid = req.params.id;
  var multi = db.multi();
  multi.get(uuid + ':yes', stdCb);
  multi.get(uuid + ':no', stdCb);
  multi.get(uuid + ':removal', stdCb);
  multi.get(uuid + ':no_connection', stdCb);
  multi.exec(function(err, replies) {
    if (err) {
      return err;
    }
    var result = {
      'yes': replies[0],
      'no': replies[1],
      'removal': replies[2],
      'no_connection': replies[3]
    };
    res.json(result);
  });
});
//Delete item
router.delete('/api/:id', function(req, res, next) {
  if (enforceReadonly(res)) {
    return;
  }

  var uuid = req.params.id;
  var multi = db.multi();
  if (uuid) {
    multi.del(uuid, stdCb);
    multi.del(uuid + ':yes', stdCb);
    multi.del(uuid + ':no', stdCb);
    multi.del(uuid + ':removal', stdCb);
    multi.del(uuid + ':no_connection', stdCb);
    multi.exec(function(err, replies) {
      if (err) return err;
      return Boolean(replies[0]) ? res.sendStatus(200) : res.sendStatus(400);
    });
  } else {
    res.sendStatus(400);
  }
});
module.exports = router;
