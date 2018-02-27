var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Site = require('../models/site');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongodb-master/";

router.get('/', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.find({}).toArray(function(err, docs) {
      if (err) return next(err);
      return res.json(docs);
    });
  });
});

router.post('/', function(req, res, next) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.insertMany(req.body, function(err, result) {
      if (err) return next(err);
      return res.json({ result: "success" });
    });
  });
});
router.route('/:ID').get(function(req,res){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("ffvl-decollage");
    var csite = dbo.collection('site');
    csite.findOne({identifiant: req.params.ID}, function(err, site) {
      if (err){
        res.send(err);
      }
      res.json(site);
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
      site.orientations.orientation= req.body.orientations.orientation;
      site.structure= req.body.structure;
      site.id= req.body.id;
      site.lastupdate= req.body.lastupdate;
      csite.update(
        { _id: 1 },{$set: {
          identifiant:site.identifiant,
          nom:site.nom,
          codepostal:site.codepostal,
          "coord.lat":site.coord.lat,
          "coord.lon":site.coord.lon,
          pratiques:site.pratiques,
          "orientations.orientation":site.orientations.orientation,
          structure:site.structure,
          id:site.id,
          lastupdate:site.lastupdate
        }},function(err,obj){
          if(err){
            res.send(err);
          }
          res.json({message : 'Bravo, mise à jour des données OK'});
        });
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
