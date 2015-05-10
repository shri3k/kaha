var express = require('express');
var router = express.Router();
var sha = require('object-hash');
var _ = require('underscore');
var utils = require('./utils');
utils.init();

console.log('Server in read-only mode ? ' + Boolean(utils.readonly));

//Get core home data
router.get('/api', function(req, res, next) {
  utils.getAllFromDb(function(err, results) {
    if (err) {
      return new Error(err);
    }
    res.send(results);
    res.end();
  });
});
router.put('/api', function(req, res, next) {
  if (utils.enforceReadonly(res)) {
    return;
  }
  var data = req.body;
  var data_uuid = data.uuid;
  utils.db.get(data_uuid, function(err, reply) {
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

    utils.db.set(data_uuid, JSON.stringify(data), function(err, reply) {
      if (err) {
        res.send('fail');
      } else {
        res.send('ok');
      }
    });

  });
});
router.post('/api', utils.rootPost);

//Get checksum of dupe items
router.get('/api/dupe', function(req, res, next) {
  utils.getAllFromDb(function(err, results) {
    var hashes = utils.getShaAll(results, ['type', 'location', 'description.contactnumber']);
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
  utils.getAllFromDb(function(err, results) {
    var similar = utils.getSimilarItems(results, req.params.sha);
    res.send(similar);
  });
});

// Get home page
router.get('/', function(req, res, next) {
  res.render('index', {
    prod: utils.env === 'prod',
    userID: sha(utils.getUniqueUserID(req))
  });
});

//Get single item
router.get('/api/:id', function(req, res, next) {
  utils.db.get(req.params.id, function(err, reply) {
    if (err) {
      return err;
    }
    res.send(reply);
  });
});
router.delete('/api/:id', function(req, res, next) {
  if (utils.enforceReadonly(res)) {
    return;
  }

  var uuid = req.params.id;
  var multi = utils.db.multi();
  if (uuid) {
    multi.del(uuid, utils.stdCb);
    multi.del(uuid + ':yes', utils.stdCb);
    multi.del(uuid + ':no', utils.stdCb);
    multi.del(uuid + ':removal', utils.stdCb);
    multi.del(uuid + ':no_connection', utils.stdCb);
    multi.exec(function(err, replies) {
      if (err) return err;
      return Boolean(replies[0]) ? res.sendStatus(200) : res.sendStatus(400);
    });
  } else {
    res.sendStatus(400);
  }
});

//Edit Flags
router.get('/api/incrflag/:id', utils.flagcounter(function(req, res, obj) {
  utils.db.incr(obj.uuid + ":" + obj.flag, function(err, reply) {
    res.sendStatus(200);
    res.end();
  });
}));

router.get('/api/decrflag/:id', utils.flagcounter(function(req, res, obj) {
  utils.db.decr(obj.uuid + ":" + obj.flag, function(err, reply) {
    res.sendStatus(200);
    res.end();
  });
}));

//Get Flags
router.get('/api/flags/:id', function(req, res, next) {
  var uuid = req.params.id;
  var multi = utils.db.multi();
  multi.get(uuid + ':yes', utils.stdCb);
  multi.get(uuid + ':no', utils.stdCb);
  multi.get(uuid + ':removal', utils.stdCb);
  multi.get(uuid + ':no_connection', utils.stdCb);
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

module.exports = router;
