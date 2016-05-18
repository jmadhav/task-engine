// Add manager to db
// Path Users/msingh/google_ads/mongo_script/add_manager.js

use task-engine-development

db.users.insert({"name" : "Rajesh", "email" : "rdhoble@etouch.net", "password" : "$2a$08$uNoJYlespsTMhzpCw8hnfeBRwFyxhjszEbtxcaEmruJ8to3A5dY0G", "is_deleted" : false, "is_active" : true, "roles" : ["Manager"]})