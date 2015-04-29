var express = require('express');
var router = express.Router();
var redis = require('redis');
var sha1 = require('object-hash');
var conf = require('../config/');
var db = redis.createClient(conf.port, conf.host);
var dbpass = process.env.DBPWD || '';
db.on('connect', function() {});
db.auth(dbpass, function() {
  console.log('Connected to the db');
});
//Get core home data
router.get('/api', function(req, res, next) {
  var results = [];
  var someString = db.keys('*', function(err, reply) {
    reply.forEach(function(id, index) {
      db.get(id, function(err, reply2) {
        if (err) {
          return new Error('Error on retrieveing');
        }
        results.push(JSON.parse(reply2));
        if (reply.length === index + 1) {
          res.send(results);
        }
      });
    });
  });
});

// Get home page
router.get('/', function(req, res, next) {
  res.render('index');
});

//EDIT POST
router.put('/api', function(req, res, next) {
  var data = req.body;
  var staleuuid = data.uuid;
  var uuid = sha1(data);
  data.uuid = uuid;
  var multi = db.multi();
  var yesHelp, noHelp, remove;

  function stdCb(err, reply) {
    if (err) {
      return err;
    }
  }
  multi.get(data.staleuuid + ":yeshelp", stdCb);
  multi.get(data.staleuuid + ":nohelp", stdCb);
  multi.get(data.staleuuid + ":remove", stdCb);
  multi.del(data.staleuuid, stdCb);
  multi.set(uuid, JSON.stingify(data), stdCb);
  multi.exec(function(err, replies) {
    if (err) {
      return new Error('failed to modify');
    }
    yeshelp = replies[0];
    nohelp = replies[1];
    removal = replies[2];
    var multi2 = db.multi();
    multi2.set(uuid + ":yeshelp", yeshelp, stdCb);
    multi2.set(uuid + ":nohelp", nohelp, stdCb);
    multi2.set(uuid + ":removal", removal, stdCb);
    multi2.exec(function(err, replies) {
      if (err) {
        return new Error("failed to set flags");
      }
      res.status(200).send('ok');
    });
  });
});

//Add Entry
router.post('/api', function(req, res, next) {
  var okResult = [];

  function entry(obj, isLastItem) {
    var uuid = sha1(obj);
    obj.uuid = uuid;
    db.set(uuid, JSON.stringify(obj), function(err, reply) {
      if (err) {
        okResult.push("fail");
      }
      okResult.push("ok");
      if (isLastItem) {
        res.send(okResult);
      }
    });
  }
  var data = req.body;
  var isLastItem = false;
  if (Array.isArray(data)) {
    data.forEach(function(item, index) {
      if (data.length === index + 1) {
        isLastItem = true;
      }
      entry(item, isLastItem);
    });
  } else {
    entry(data, true);
  }
});

//Edit Flags
router.get('/api/:id', function(req, res, next) {
  var uuid = req.params.id;
  var flag = req.query.flag;
  db.incr(uuid + ":" + flag, function(err, reply) {
    res.send(reply);
  });
});
module.exports = router;
