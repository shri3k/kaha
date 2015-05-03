var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var url = require('url');

var routes = require('./routes/index');

var app = express();

//Cors Headers
var CORS = function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
};

//Allow only kaha.co and demokaha to post
var AllowPOST = function(req, res, next) {
  var ref = (req.headers && req.headers.referer) || false;
  if (ref) {
    var u = url.parse(ref);
    var hostname = u && u.hostname.toLowerCase();
    if (hostname === "kaha.co" || hostname === "demokaha.herokuapp.com") {
      return next();
    }
  }
  res.status(403).send('Invalid Origin');
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(compression());
app.use(AllowPOST);
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(CORS);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
