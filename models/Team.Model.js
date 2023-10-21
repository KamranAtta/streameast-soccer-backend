var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
  teamName:{type:String},
  teamImage:{type:String},
  description:{type:String},
  publicId:{type:String},
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('Team', TeamSchema);