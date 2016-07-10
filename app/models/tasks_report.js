var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;
  mongoosePaginate = require('mongoose-paginate');

var TaskReportSchema = new Schema({
  created_at: { type: Date},
  "Name":{type: String, default: '' },
  "Ldap":{type: String, default: '' },
  "Query/URL/Cached Page HTML":{type: String, default: '' },
  "F":{type: String, default: '' },
  "Ad creative / Review":{type: String, default: '' },
  "Ac Rating / Review Rating":{type: String, default: '' },
  "Rule Applied":{type: String, default: '' },
  "AC Flag":{type: String, default: '' },
  "AC Comments":{type: String, default: '' },
  "AC Feedback":{type: String, default: '' },
  "Landing Page": { type: String, default: '' },                         
  "LP Rating": { type: String, default: '' }
});


var TaskReport = module.exports = mongoose.model('TaskReport', TaskReportSchema);
