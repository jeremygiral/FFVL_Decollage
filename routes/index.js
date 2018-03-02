var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mysql = require('mysql');
var Site = require('../models/site');
//var client = mongodb.MongoClient;
var DarkSky = require('forecast.io');
var options = {
  APIKey: "f72cd83ecf6688273f64a0b549b01498",
  timeout: 10000,
  exclude: 'minutely,hourly,daily,flags,alerts'
};
var con = mysql.createConnection({
  host: "mysql",
  port: "3306",
  user: "test",
  password: "test",
  database : "ffvldecollage"
});

router.get('/IsVolable/:IdSite&:time',function(req,res,next){
  darksky = new DarkSky(options);
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://mongodb-master/";
  var now = new Date();
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var colm = dbo.collection('meteo');
    dbo.collection("site").findOne({_identifiant: req.params.IdSite}, function(err, sitec) {
      if (err) return next(err);
      con.connect(function(err){
        if(err) throw err;
        var site_proche=[];
        con.query("SELECT distinct(a.identifiant), a.nom,a.lat, a.lon, SQRT(POW(69.1 * (a.lat - b.lat), 2) + POW(69.1 * (b.lon - a.lon) * COS(a.lat / 57.3), 2)) AS distance FROM sites a , (select * from sites where identifiant=" + sitec._identifiant + ") b HAVING distance >0 ORDER BY distance limit 5;", function (err, result) {
          if(err) throw err;
          result.forEach(function(ress){
            site_proche.push({identifiant: ress.identifiant,nom: ress.nom});
          });
          colm.aggregate([{$match: {idSite:req.params.IdSite}},{ $group : { _id: "$idSite", dateprev: { $max : "$dateprev" }}}]).toArray(function(err,maxmeteo){
            if (err) throw err;
            if(maxmeteo=![] && Math.abs(now - maxmeteo[0].dateprev)<30*1000){
              colm.findOne({idSite:maxmeteo[0]._id,dateprev:maxmeteo[0].dateprev},function(err,meteo){
                return res.json(meteo);
              });
            }
            else {
              if (req.params.time){
                var time = new Date(req.params.time); // lets use an arbitrary date
                var unixTime = Math.floor(time.getTime()/1000); //Get the UNIX timestamp needed for the api.
                darksky.getAtTime(sitec.coord._lat, sitec.coord._lon, unixTime, function (err, results, data) {

                  if(data.currently.precipProbability>0.5){
                    volable=false;
                  }
                  if(data.currently.windSpeed<35 && data.currently.windGust <35){
                    volable=false;
                  }
                  var dir;
                  if (data.currently.windBearing < 11.25) {
                    dir = "N";
                  } 	else if (data.currently.windBearing >= 11.25 && data.currently.windBearing < 33.75) {
                    dir = "NNE";
                  }	else if (data.currently.windBearing >= 33.75 && data.currently.windBearing < 56.25) {
                    dir = "NE";
                  }	else if (data.currently.windBearing >= 56.25 && data.currently.windBearing < 78.75) {
                    dir = "ENE";
                  }	else if (data.currently.windBearing >= 78.75 && data.currently.windBearing < 101.25) {
                    dir = "E";
                  }	else if (data.currently.windBearing >= 101.25 && data.currently.windBearing < 123.75) {
                    dir = "ESE";
                  }	else if (data.currently.windBearing >= 123.75 && data.currently.windBearing < 146.25) {
                    dir = "SE";
                  }	else if (data.currently.windBearing >= 146.25 && data.currently.windBearing < 168.75) {
                    dir = "SSE";
                  }	else if (data.currently.windBearing >= 168.75 && data.currently.windBearing < 191.25) {
                    dir = "S";
                  }	else if (data.currently.windBearing >= 191.25 && data.currently.windBearing < 213.75) {
                    dir = "SSO";
                  }	else if (data.currently.windBearing >= 213.75 && data.currently.windBearing < 236.25) {
                    dir = "SO";
                  }	else if (data.currently.windBearing >= 236.25 && data.currently.windBearing < 258.75) {
                    dir = "OSO";
                  }	else if (data.currently.windBearing >= 258.75 && data.currently.windBearing < 281.25) {
                    dir = "O";
                  }	else if (data.currently.windBearing >= 281.25 && data.currently.windBearing < 303.75) {
                    dir = "ONO";
                  }	else if (data.currently.windBearing >= 303.75 && data.currently.windBearing < 326.25) {
                    dir = "NO";
                  }	else if (data.currently.windBearing >= 326.25 && data.currently.windBearing < 348.75) {
                    dir = "NNO";
                  } else {
                    dir = "N";
                  }

                  if(sitec.orientations.orientation.indexOf(dir)>-1 || sitec.orientations.orientation.value==="TOUTES"){
                    volable=true;
                  } else {
                    volable=false;
                  }

                  //console.log(volable);
                  var resultat = {};
                  resultat.IsVolable = volable;
                  resultat.key = {IdSite_Date:req.params.IdSite + '_'+ data.currently.time};
                  resultat.idSite = req.params.IdSite;
                  resultat.dateprev = new Date(data.currently.time);
                  resultat.resume = data.currently.summary;
                  resultat.directionDegres = data.currently.windBearing;
                  resultat.vitesseVent = data.currently.windSpeed;
                  resultat.vitesseRafale = data.currently.windGust;
                  resultat.precipProba = data.currently.precipProbability;
                  resultat.directionSite = sitec.orientations;
                  resultat.directionVent = dir;
                  resultat.uvIndex = data.currently.uvIndex;
                  resultat.site_proche=site_proche;
                  dbo.collection("meteo").insertOne(resultat, function(err, previ) {
                    if (err) return next(err);
                    //return res.json({ result: "success" });
                  });
                  return res.json({resultats: resultat});

                });
              } else {
                darksky.get(sitec.coord.lat, sitec.coord.lon, function (err, results, data) {
                  if (err) throw err;
                  var volable=true;
                  if(data.currently.precipProbability>0.5){
                    volable=false;
                  }
                  if(data.currently.windSpeed<35 && data.currently.windGust <35){
                    volable=false;
                  }
                  var dir;
                  if (data.currently.windBearing < 11.25) {
                    dir = "N";
                  } 	else if (data.currently.windBearing >= 11.25 && data.currently.windBearing < 33.75) {
                    dir = "NNE";
                  }	else if (data.currently.windBearing >= 33.75 && data.currently.windBearing < 56.25) {
                    dir = "NE";
                  }	else if (data.currently.windBearing >= 56.25 && data.currently.windBearing < 78.75) {
                    dir = "ENE";
                  }	else if (data.currently.windBearing >= 78.75 && data.currently.windBearing < 101.25) {
                    dir = "E";
                  }	else if (data.currently.windBearing >= 101.25 && data.currently.windBearing < 123.75) {
                    dir = "ESE";
                  }	else if (data.currently.windBearing >= 123.75 && data.currently.windBearing < 146.25) {
                    dir = "SE";
                  }	else if (data.currently.windBearing >= 146.25 && data.currently.windBearing < 168.75) {
                    dir = "SSE";
                  }	else if (data.currently.windBearing >= 168.75 && data.currently.windBearing < 191.25) {
                    dir = "S";
                  }	else if (data.currently.windBearing >= 191.25 && data.currently.windBearing < 213.75) {
                    dir = "SSO";
                  }	else if (data.currently.windBearing >= 213.75 && data.currently.windBearing < 236.25) {
                    dir = "SO";
                  }	else if (data.currently.windBearing >= 236.25 && data.currently.windBearing < 258.75) {
                    dir = "OSO";
                  }	else if (data.currently.windBearing >= 258.75 && data.currently.windBearing < 281.25) {
                    dir = "O";
                  }	else if (data.currently.windBearing >= 281.25 && data.currently.windBearing < 303.75) {
                    dir = "ONO";
                  }	else if (data.currently.windBearing >= 303.75 && data.currently.windBearing < 326.25) {
                    dir = "NO";
                  }	else if (data.currently.windBearing >= 326.25 && data.currently.windBearing < 348.75) {
                    dir = "NNO";
                  } else {
                    dir = "N";
                  }
                  if(sitec.orientations.indexOf(dir)>-1 || sitec.orientations.orientation.value==="TOUTES"){
                    volable=true;
                  } else {
                    volable=false;
                  }

                  //console.log(volable);
                  var resultat = {};
                  resultat.IsVolable = volable;
                  resultat.key = {IdSite_Date:req.params.IdSite + '_'+ data.currently.time};
                  resultat.idSite = req.params.IdSite;
                  resultat.dateprev = new Date(data.currently.time);
                  resultat.resume = data.currently.summary;
                  resultat.directionDegres = data.currently.windBearing;
                  resultat.vitesseVent = data.currently.windSpeed;
                  resultat.vitesseRafale = data.currently.windGust;
                  resultat.precipProba = data.currently.precipProbability;
                  resultat.directionSite = sitec.orientations;
                  resultat.directionVent = dir;
                  resultat.uvIndex = data.currently.uvIndex;
                  resultat.site_proche={"Liste des sites les plus proches :": site_proche};
                  dbo.collection("meteo").insertOne(resultat, function(err, previ) {
                    if (err) return next(err);
                    //return res.json({ result: "success" });
                  });
                  return res.json({resultats: resultat});
                });
              }
            }
          });
        });
      });
    });
  });
});

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




module.exports = router;
