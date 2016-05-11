// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  ObjectId = Schema.ObjectId;

var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  name: { type: String, index: true },
  email: { type: String, index: true },
  password: String,
  is_deleted: { type: Boolean, default: false },
  created_at : { type: Date, default: Date.now },
  updated_at : { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  roles: { type: Array, default: [] },
  manage_user_ids: { type: Array, default: [] },
  manage_by_user_id: { type: ObjectId, index: true }
});

//UserSchema.virtual('date').get(function(){ return this._id.getTimestamp(); });

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var User = module.exports = mongoose.model('User', UserSchema);

