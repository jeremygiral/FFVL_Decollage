var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Site = require('../models/site');
//var client = mongodb.MongoClient;

var uri = "mongodb://mongo/ffvl-decollage";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', function(req, res, next) {
  mongoose.connect(uri, function (err, db) {
    if (err) return next(err);
    var site = db.collection('site');
    site.find({}).toArray(function(err, docs) {
      if (err) return next(err);
      return res.json(docs);
    });
  });
});

router.post('/', function(req, res, next) {
  mongoose.connect(uri, function (err, db) {
    if (err) return next(err);
    var site = db.collection('dummy');
    site.insertMany(req.body, function(err, result) {
      if (err) return next(err);
      return res.json({ result: "success" });
    });
  });
});
router.route('/:ID')
.get(function(req,res){
  Site.findById(req.params.ID, function(err, site) {
    if (err){
      res.send(err);
    }
    res.json(site);
  });
})
.put(function(req,res){
  Site.findById(req.params.ID, function(err, site) {
    if (err){
      res.send(err);
    }
    site.identifiant= req.body.identifiant;
    site.nom= req.body.nom;
    site.codepostal.value= req.body.codepostal.value;
    site.coord.lat= req.body.coord.lat;
    site.coord.lon= req.body.coord.lon;
    req.body.pratiques.forEach(function(pratique){
      site.pratiques.push(pratique.value);
    });
    site.orientations.orientation.value= req.body.orientations.orientation.value;
    site.structure.value= req.body.structure.value;
    site.id.value= req.body.id.value;
    site.lastupdate.value= req.body.lastupdate.value;
    site.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message : 'Bravo, mise à jour des données OK'});
    });
  });
})
.delete(function(req,res){

  Site.remove({_id: req.params.ID}, function(err, site){
    if (err){
      res.send(err);
    }
    res.json({message:"Bravo, site supprimé"});
  });

});
router.route('/softdelete/:ID')
.get(function(req,res){
  Site.findById(req.params.ID, function(err, site) {
    if (err){
      res.send(err);
    }
    site.isValable=false;
    site.save();
    res.send({message:"Site désactivée."});
  });
});



module.exports = router;
