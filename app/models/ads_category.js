var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var AdscategorySchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  mobile_ads: {type: Number, default: 0 },
  search_ads: { type: Number, default: 0 },
  product_ads: {type: Number, default: 0 },
  content_ads: {type: Number, default: 0 },
  Keyword: { type: String, default: "" },
  Gambling: { type: String, default: "" },
  total: { type: Number, default: 0 }, 
  created_at : { type: Date }       
});

var Adscategory = module.exports = mongoose.model('Adscategory', AdscategorySchema);