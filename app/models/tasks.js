var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;
  mongoosePaginate = require('mongoose-paginate');

var TaskSchema = new Schema({
  user_id: { type: ObjectId, index: true },
  user_name:{type: String, default: ''},
 // task: { type: String, default: '' },
  S_No:{type: String, default: '' },
  query:{type: String, default: '' },
  query_flag:{type: String, default: '' },
  ad_creative:{type: String, default: '' },
  ad_creative_flag:{type: String, default: '' },
  ad_creative_rating:{type: String, default: '' },
  landing_page:{type: String, default: '' },
  landing_page_flag:{type: String, default: '' },
  landing_page_rating:{type: String, default: '' },
  user_comments:{type: String, default: '' },
  verifier_comments: { type: String, default: '' },                         
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date},
  updated_at: { type: Date},
  is_correct: Boolean,
  verifier_id: { type: ObjectId, index: true },
  verifier_name:{type: String, default: ''},
  is_audit_task:{ type: Boolean, default: false },
  user_group_id: { type: ObjectId, index: true }
});

TaskSchema.plugin(mongoosePaginate);

var Task = module.exports = mongoose.model('Task', TaskSchema);
