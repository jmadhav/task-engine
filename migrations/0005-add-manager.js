
var mongodb = require('mongodb');

exports.up = function(db, next){
	//var users = db.Collection('users');
	//users.insert({"name" : "Rajesh Dhoble", "email" : "rdhoble@etouch.net", "password" : "$2a$08$uNoJYlespsTMhzpCw8hnfeBRwFyxhjszEbtxcaEmruJ8to3A5dY0G", "is_deleted" : false, "is_active" : true, "roles" : ["Manager"]}, next);
};

exports.down = function(db, next){
	//var users = db.Collection('users');
	//users.findAndModify({name: 'Rajesh Dhoble'}, [], {}, { remove: true }, next);
};
