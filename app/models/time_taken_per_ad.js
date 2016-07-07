var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var TimeTakenPerAdSchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  ads_category: {type: String, default: '' },
  average_time_taken_per_ad: { type: Number, default: 0 },
  created_at : { type: Date }

});

var TimeTakenPerAd = module.exports = mongoose.model('TimeTakenPerAd', TimeTakenPerAdSchema);