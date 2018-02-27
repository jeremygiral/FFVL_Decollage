var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var sites = require('./routes/sites');
var api = require('./routes/api');
var fs = require("fs");


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
var mysql = require('mysql');
var sys = require('util')
var exec = require('child_process').exec;


var con = mysql.createConnection({
  host: "mysql",
  port: "3306",
  user: "test",
  password: "test",
  database : "ffvldecollage"
});

con.connect(function(err) {
  if (err) console.log(err);
  console.log("Connected!");
  con.query("SELECT * FROM SITES;", function (err, result) {
    if (err){
      var sql = fs.readFileSync("create-mysql-db.sql", "UTF-8");
      con.query(sql, function (err, result) {
        if (err) throw err;
        //console.log("Result: " + result);
      });
    }
  });
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongodb-master/";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("ffvl-decollage");
  var csite = dbo.collection('site');
  csite.count({},function(err, nbdocs) {
    if (err) return next(err);
    console.log(nbdocs);
    if (nbdocs===0){
      function puts(error, stdout, stderr) { sys.puts(stdout) }
      exec("mongoimport --uri \"mongodb://mongodb-master/ffvl-decollage\" -c site --file decollages.json --jsonArray", puts);
      console.log("init données ok");
    }
  });
});
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
