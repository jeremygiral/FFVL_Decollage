var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema=new Schema({
  identifiant: {type: Number, require: true},
  nom: {type: String, require: true},
  codepostal: {type: String},
  coord:{
    lat:{type: Number},
    lon:{type: Number}
  },
  pratiques: [{pratique: {type: String}}],
  orientations: [{orientation: {type: String}}],
  altitude: {type: Number},
  structure: {type: Number},
  structure_id: {type: Number},
  lastupdate: {type: Date},
  isValable: {type: Boolean, default: true}
});

module.exports = mongoose.model('Site',schema);
