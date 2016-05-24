var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var GroupSchema = new Schema({
  name: { type: String, index: true },
  created_at : { type: Date },
  updated_at : { type: Date },
  is_deleted: { type: Boolean, default: false }
});

var Group = module.exports = mongoose.model('Group', GroupSchema);
