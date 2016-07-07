var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var WeeklyAdsReportSchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  created_at : { type: Date }, 
  ads_category: { type: String, default: 0 },
  total_ratings: { type: Number, default: 0 },
  total_count_of_analyst: { type: Number, default: 0 },
  avg_ads_analyst: { type: Number, default: 0 },
  avg_hours_analyst: { type: Number, default: 0 },
  productivity: { type: Number, default: 0 },
  quality: { type: Number, default: 0 }

});

var WeeklyAdsReport = module.exports = mongoose.model('WeeklyAdsReport', WeeklyAdsReportSchema);