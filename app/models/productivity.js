var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var ProductivitySchema = new Schema({
  name: { type: String},
  email: { type: String, index: true },
  noads: {type: Number, default: 0},
  active_time: { type: Number, default: 0},
  productivity: {type: Number, default: 0},
  quality: {type: Number, default: 0},
  created_at : { type: Date }    
 
});

var Productivity = module.exports = mongoose.model('Productivity', ProductivitySchema);