var express = require('express');
var router = express.Router();
var redis = require('redis');
var md5 = require('object-hash');
var conf = require('./conf');
var db = redis.createClient(10191, "pub-redis-10191.us-east-1-4.2.ec2.garantiadata.com");
db.on('connect', function(){});
db.auth(conf.auth, function() {
  console.log('Connected to the db');
});
/* GET home page. */
router.get('/api', function(req, res, next) {
  var results = [];
  var someString = db.keys('*', function(err, reply) {
    reply.forEach(function(id, index) {
      db.get(id, function(err, reply2) {
        if (err) {
          return new Error('Error on retrieveing');
        }
        results.push(reply2);
        if (reply.length === index + 1) {
          res.send(results);
        }
      });
    });
  });
});

router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/api', function(req, res, next) {
  // var data = {
  //   "type": "water",
  //   "location": {
  //     "district": "kathmandu",
  //     "tole": "basantapur"
  //   },
  //   "description": {
  //     "title": "title1",
  //     "detail": "some details"
  //   },
  //   "active": "true",
  // };
  var data = req.body;
  var uuid = md5(data);
  data.uuid = uuid;
  db.set(uuid, JSON.stringify(data), function(err, reply) {
    res.status(200).send('ok');
  });
});

router.get('/api/:id', function(req, res, next) {
  var uuid = req.params.id || md5(req.body);
});
module.exports = router;
