var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var HeadCountSchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  total_head_count: {type: Number, default: 0 },
  total_active_accounts: { type: Number, default: 0 },
  todays_active_count: { type: Number, default: 0 },
  created_at : { type: Date } 

});

var HeadCount = module.exports = mongoose.model('HeadCount', HeadCountSchema);