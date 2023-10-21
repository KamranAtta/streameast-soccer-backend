var mongoose = require('mongoose');

var NewsSchema = new mongoose.Schema({
  title:{type:String},
  image:{type:String},
  imageThumb:{type:String},
  category:{type:String},
  description:{type:String},
  htmlDescription:{type:String},
  trending:{type:Boolean, default: false},
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('News', NewsSchema);