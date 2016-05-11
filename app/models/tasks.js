var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var TaskSchema = new Schema({
  user_id: { type: ObjectId, index: true },
  task: { type: String, default: '' },
  verifier_comments: { type: String, default: '' },													
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_correct: Boolean,
  verifier_id: { type: ObjectId, index: true }
});

var Task = module.exports = mongoose.model('Task', TaskSchema);
