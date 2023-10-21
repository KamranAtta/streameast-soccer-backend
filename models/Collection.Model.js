var mongoose = require('mongoose');

var CollectionSchema = new mongoose.Schema({
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
  collectionName:{type:String},
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('Collection', CollectionSchema);