var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route('/sites')

.get(function(req,res){
  Site.find(function(err, sites){
    if (err){
      res.send(err);
    }
    res.json(sites);

  })
}) // SUITE DU CODE

.post(function(req,res){
  // Nous utilisons le schéma Piscine
  var site = new Site();
  // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
  site.user = req.body.user;
  site.panier = req.body.panier;


  //Nous stockons l'objet en base
  site.save(function(err){
    if(err){
      res.send(err);
    }
    res.send({message : 'Bravo, le site est maintenant stockée en base de données'});
  })
})


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
    site.user = req.body.user;
    site.panier = req.body.panier;


    site.save(function(err){
      if(err){
        res.send(err);
      }
      res.json({message : 'Bravo, mise à jour du site OK'});
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
