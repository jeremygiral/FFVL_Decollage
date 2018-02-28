var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Site = require('../models/site');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongodb-master/";
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "mysql",
  port: "3306",
  user: "test",
  password: "test",
  database : "ffvldecollage"
});

router.get('/', function(req, res, next) {

  //Données MongDB

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.find({}).toArray(function(err, docs) {
      if (err) return next(err);
      return res.json(docs);
    });
  });

  //Données provenant de MYSQL

  // con.connect(function(err){
  //   if(err) throw err;
  //   con.query("Select distinct sites.*, orientation.nom as orientation,discipline.nom as pratique from sites left join site_discipline on site_discipline.id_site=sites.identifiant left join discipline on discipline.id_discipline=site_discipline.id_discipline left join site_orientation on sites.identifiant=site_orientation.id_site left join orientation on orientation.id_orientation=site_orientation.id_orientation order by identifiant", function (err, result) {
  //     if(err) throw err;
  //     return res.json(result);
  //   });
  // });
});

router.post('/', function(req, res, next) {
//Insertion MongoDB
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.insertMany(req.body, function(err, result) {
      if (err) return next(err);
      return res.json({ result: "success" });
    });
  });
//Insertion MySQL
  con.connect(function(err){
    if(err) throw err;
    //Insertion Sites
    con.query("INSERT INTO sites VALUES ("+req.body.identifiant+",'"+req.body.nom+"','"+req.body.codepostal+"',"+req.body.lat+","+req.body.lon+","+req.body.structure+","+req.body.id_structure+")", function (err, result) {
      if(err) throw err;
      if(req.body.orientations){
        req.body.orientations.forEach(function(or){
          //Recup id_orientation
          con.query("SELECT id_orientation FROM orientation WHERE Code='"+or+"'", function (err, result) {
            if (err) throw err;
            if(result[0]){
              con.query("INSERT INTO site_orientation (id_site,id_orientation) VALUES ("+req.body.identifiant+","+result[0].id_orientation+");");
            }
          });
        });
      }
      if(req.body.pratiques){
        req.body.pratiques.forEach(function(pr){
          con.query("SELECT id_discipline FROM discipline WHERE nom='"+pr+"'", function (err, result) {
            if (err) throw err;
            if(result[0]){
              con.query("INSERT INTO site_discipline (id_site,id_discipline) VALUES ("+req.body.identifiant+","+result[0].id_discipline+")");
            }
          });
        });
      }
    });
  });
});

router.route('/:ID').get(function(req,res){

  //Affiche Info Site MongoDB

  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("ffvl-decollage");
  //   var csite = dbo.collection('site');
  //   csite.findOne({identifiant: req.params.ID}, function(err, site) {
  //     if (err){
  //       res.send(err);
  //     }
  //     res.json(site);
  //   });
  // });

  //Affiche Info Site MySQL

  con.connect(function(err){
    if(err) throw err;
    con.query("Select distinct sites.*, orientation.nom as orientation,discipline.nom as pratique from sites left join site_discipline on site_discipline.id_site=sites.identifiant left join discipline on discipline.id_discipline=site_discipline.id_discipline left join site_orientation on sites.identifiant=site_orientation.id_site left join orientation on orientation.id_orientation=site_orientation.id_orientation where identifiant="+req.params.ID+" order by identifiant", function (err, result) {
      if(err) throw err;
      return res.json(result);
    });
  });
})

.put(function(req,res){
  csite.findOne({identifiant: req.params.ID}, function(err, site) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("ffvl-decollage");
      var csite = dbo.collection('site');
      if (err){
        res.send(err);
      }
      site.identifiant= req.body.identifiant;
      site.nom= req.body.nom;
      site.codepostal= req.body.codepostal;
      site.coord.lat= req.body.coord.lat;
      site.coord.lon= req.body.coord.lon;
      req.body.pratiques.forEach(function(pratique){
        site.pratiques.push(pratique);
      });
      req.body.orientations.forEach(function(orientation){
        site.orientations.push(orientation);
      });
      site.structure= req.body.structure;
      site.id= req.body.id;
      site.lastupdate= time.getTime();
      csite.update(
        { _id: 1 },{$set: {
          nom:site.nom,
          "codepostal._value":site.codepostal,
          "coord._lat":site.coord.lat,
          "coord._lon":site.coord.lon,
          pratiques:site.pratiques,
          orientations:site.orientations,
          "structure._value":site.structure,
          "id._value":site.id,
          "lastupdate._value":site.lastupdate
        }},function(err,obj){
          if(err){
            res.send(err);
          }
          res.json({message : 'Bravo, mise à jour des données OK'});
        });
      });
      con.connect(function(err){
      con.query("UPDATE sites SET nom="+req.body.nom+",codepostal="+req.body.codepostal+",lat="+req.body.lat+",lon="+req.body.lon+",structure="+req.body.structure+",id_structure="+req.body.id+" WHERE identifiant="+req.params.ID);
      con.query("delete site_orientation where id_orientation not in(select id_orientation from orientation where code in "+site.orientations+")");
      con.query("delete site_discipline where id_discipline not in(select id_discipline from discipline where nom in "+site.pratiques+")");
      if(req.body.orientations){
        req.body.orientations.forEach(function(or){
          //Recup id_orientation
          con.query("SELECT id_orientation FROM orientation WHERE Code='"+or+"'", function (err, result) {
            if (err) throw err;
            if(result[0]){
              con.query("INSERT INTO site_orientation (id_site,id_orientation) VALUES ("+req.body.identifiant+","+result[0].id_orientation+");");
            }
          });
        });
      }
      if(req.body.pratiques){
        req.body.pratiques.forEach(function(pr){
          con.query("SELECT id_discipline FROM discipline WHERE nom='"+pr+"'", function (err, result) {
            if (err) throw err;
            if(result[0]){
              con.query("INSERT INTO site_discipline (id_site,id_discipline) VALUES ("+req.body.identifiant+","+result[0].id_discipline+")");
            }
          });
        });
      }
      });
    });

  })

.delete(function(req,res){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.remove({_id: req.params.ID}, function(err, site){
      if (err){
        res.send(err);
      }
      res.json({message:"Bravo, site supprimé"});
    });
  });
  con.connect(function(err){
    if(err) throw err;
    con.query("Delete from sites where identifiant="+req.params.ID, function (err, result) {
      if(err) throw err;
    });
    con.query("Delete from site_orientation where id_site="+req.params.ID);
    con.query("Delete from site_discipline where id_site="+req.params.ID);
  });
});

router.route('/softdelete/:ID').get(function(req,res){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.find({identifiant: req.params.ID}, function(err, site) {
      if (err){
        res.send(err);
      }
      site.isValable=false;
      site.save();
      res.send({message:"Site désactivée."});
    });
  });
});
module.exports = router;
