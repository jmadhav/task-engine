module.exports.id = "add-manager";

module.exports.up = function (done) {
  var coll = this.db.collection('users');
  coll.insert({"name" : "Rajesh Dhoble", "email" : "rdhoble@etouch.net", "password" : "$2a$08$uNoJYlespsTMhzpCw8hnfeBRwFyxhjszEbtxcaEmruJ8to3A5dY0G", "is_deleted" : false, "is_active" : true, "roles" : ["Manager"]}, done);
  done();
};

module.exports.down = function (done) {
  var coll = this.db.collection('users');
  coll.remove({name: 'Rajesh Dhoble'}, done);
  done();
};