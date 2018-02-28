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
var Decimal = require('decimal.js');

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
  if (err) throw (err);
  con.query("SELECT count(1) as nb FROM sites;", function (err, result) {
    if (err) throw (err);
    if(result[0].nb===0){
      var parsejson = fs.readFileSync("decollages.json", "UTF-8");
      var json=JSON.parse(parsejson);
      json.forEach(function(site){

        if(site.orientations){
          site.orientations.orientation.forEach(function(or){
            con.query("SELECT id_orientation FROM orientation WHERE Code='"+or._value+"'", function (err, result) {
              if (err) throw err;
              if(result[0]){
                con.query("INSERT INTO site_orientation (id_site,id_orientation) VALUES ("+site._identifiant+","+result[0].id_orientation+");");
              }
            });

          });
        }
        if(site.pratiques){
          site.pratiques.pratique.forEach(function(pr){
            con.query("SELECT id_discipline FROM discipline WHERE nom='"+pr._value+"'", function (err, result) {
              if (err) throw err;
              if(result[0]){
                con.query("INSERT INTO site_discipline (id_site,id_discipline) VALUES ("+site._identifiant+","+result[0].id_discipline+")");
              }
            });
          });
        }
        site._identifiant=site._identifiant|0;
        site.nom=site.nom|'NA';
        site.codepostal._value=site.codepostal._value|'NA';
        site.coord._lat=new Decimal(site.coord._lat)|0;
        site.coord._lon=new Decimal(site.coord._lon)|0;
        site.structure._value=site.structure._value|0;
        site.id._value=site.id._value|0;
        var sql_site="INSERT INTO sites (identifiant,nom,codepostal,lat,lon,structure,id_structure) VALUES("+site._identifiant+",'"+site.nom+"','"+site.codepostal._value+"',"+site.coord._lat+","+site.coord._lon+","+site.structure._value+","+site.id._value+");";
        con.query(sql_site, function (err, result) {
          if (err) throw err;
        });
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
    if (nbdocs===0){
      function puts(error, stdout, stderr) { sys.puts(stdout) }
      exec("mongoimport --uri \"mongodb://mongodb-master/ffvl-decollage\" -c site --file decollages.json --jsonArray", puts);
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
