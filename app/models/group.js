var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var GroupSchema = new Schema({
  name: { type: String, index: true }
});

var Group = module.exports = mongoose.model('Group', GroupSchema);
