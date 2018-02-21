var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var sites = require('./routes/sites');
var api = require('./routes/api');



// permet de mettre une icone dans l'onglet
var favicon = require('serve-favicon');
var logger = require('morgan');
// permet l'utilisation des cookies
var cookieParser = require('cookie-parser');
// permet de parser
var bodyParser = require('body-parser');
//permet l'utilisation du format hbs
var expressHbs = require('express-handlebars');
// orm de mongodb
var mongoose = require('mongoose');

//affiche des messages type alert
//var flash=require('connect-flash');

//on charge les fichiers de routes
var index = require('./routes/index');
var sites = require('./routes/sites');
var api = require('./routes/api');
var app = express();

mongoose.connect('mongodb://mongodb/ffvl-decollage');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/sites', sites);
app.use('/api',api);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
