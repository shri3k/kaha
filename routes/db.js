var redis = require('redis');
var conf = require('../config/');
var dbpass = process.env.DBPWD || '';
module.exports = function() {
  var db = redis.createClient(conf.dbport, conf.dbhost);
  db.on('connect', function() {
    console.log('Connected to the ' + conf.name + ' db: ' + conf.dbhost + ":" + conf.dbport);
  });
  db.auth(dbpass, function() {
    console.log("db auth success");
  });
  return db;
};
