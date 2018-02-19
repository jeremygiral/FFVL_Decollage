var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
//var client = mongodb.MongoClient;

var uri = "mongodb://mongo/ffvl-decollage";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/data/from/db', function(req, res, next) {
    mongoose.connect(uri, function (err, db) {
	    if (err) return next(err);
    	var site = db.collection('site');
    	site.find({}).toArray(function(err, docs) {
			if (err) return next(err);
			return res.json(docs);
    	});
	});
});

router.post('/data/into/db', function(req, res, next) {
	mongoose.connect(uri, function (err, db) {
	    if (err) return next(err);
    	var site = db.collection('dummy');
    	site.insertMany(req.body, function(err, result) {
        if (err) return next(err);
			  return res.json({ result: "success" });
    });
    //console.log(db);
	});
});

module.exports = router;
