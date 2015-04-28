var express = require('express');
var router = express.Router();
var redis = require('redis');
var sha1 = require('object-hash');
var conf = require('./conf');
var db = redis.createClient(10191, "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com");
db.on('connect', function() {});
db.auth(conf.auth, function() {
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
  var uuid = req.params.id || sha1(req.body);
  db.get(uuid, function(err, reply) {
    res.send(JSON.parse(reply));
  });
});
module.exports = router;
