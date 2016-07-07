var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var WeeklyUserReportSchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  created_at : { type: Date }, 
  total_ads_rated: {type: Number, default: 0 },
  average_ads_pre_search_analyst: { type: Number, default: 0 },
  average_hours_by_analyst: { type: Number, default: 0 },
  average_productivity: { type: Number, default: 0 },
  average_quality: { type: Number, default: 0 },

});

var WeeklyUserReport = module.exports = mongoose.model('WeeklyUserReport', WeeklyUserReportSchema);