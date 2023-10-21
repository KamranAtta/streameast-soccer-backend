var mongoose = require('mongoose');

var LeagueSchema = new mongoose.Schema({
  leagueName:{type:String},
  leagueImage:{type:String},
  description:{type:String},
  publicId:{type:String},
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('League', LeagueSchema);