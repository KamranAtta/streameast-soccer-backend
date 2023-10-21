var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  subCategories: [{ type: String }],
  categoryName:{type:String},
  createdAt:{type:Date, default:Date.now}
}, { toJSON: { getters: true } });
module.exports = mongoose.model('Category', CategorySchema);