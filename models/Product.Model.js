var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  collectionName:{type:String},
  categoryName:{type:String},
  subCategoryName:{type:String},
  name:{type:String},
  title:{type:String},
  description:{type:String},
  image:{type:String},
  thumbImage:{type:String},
  rating:{type:Number},
  total_reviews:{type:String},
  brand:{type:String},
  summary:{type:String},
  color:{type:String},
  link:{type:String},
  price:{type:String},
  bestSeller:{type:Boolean, default:false},
  attributes:mongoose.Schema.Types.Mixed,
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('Product', ProductSchema);