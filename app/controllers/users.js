var express = require('express'),
    router = express.Router();
mongoose = require('mongoose');
User = mongoose.model('User');
passport = require('passport');
_und = require("underscore"); 

module.exports = function(app, passport) {
    app.use('/', router);
};

router.get('/', function(req, res, next) {
    if (req.isAuthenticated()){
      
        if(req.user.roles.indexOf('Manager') != -1 || req.user.roles.indexOf('Lead')!=-1){

            res.redirect("/audit_task");
        } else if(req.user.roles.indexOf('Analyst') != -1 || req.user.roles.indexOf('Moderator')!=-1){

            res.redirect("/view_task");
        }
        

    }else{
    res.render('users/login', {
        title: 'Task',
        message: req.flash('loginMessage')
    });

}
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { 
      return res.render('users/login', {message: req.flash('loginMessage'), title: 'Task'});
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); 
      }
         if(req.user.roles.indexOf('Manager') != -1 || req.user.roles.indexOf('Lead')!=-1){
            return res.redirect('/audit_task');
            
        } else if(req.user.roles.indexOf('Analyst') != -1 || req.user.roles.indexOf('Moderator')!=-1){

           return res.redirect("/view_task");
        }
      
    });
  })(req, res, next);
});

router.get('/new-users', isLoggedIn, isManager, function(req, res) {
    res.render('users/new_user', {
        user: req.user,
        title: 'User',
        message: req.flash('signupMessage')
    });
});

router.post('/new-users', passport.authenticate('local-signup', {
    successRedirect: '/users', // redirect to the secure profile section
    failureRedirect: '/new-users', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

router.get('/profile', isLoggedIn, function(req, res) {
    res.render('users/profile', {
        user: req.user,
        title: 'Task'
    });
});

router.get('/profile/:id/edit', isLoggedIn, isManager, function(req, res) {
    var id = req.params.id
    User.findById(id, function(err, user) {
        if (err) return next(err);
        res.render('users/edit_user', {
            user: user,
            title: 'Task'
        });
    });
});

router.post('/assign-group', isLoggedIn, isManager, function(req, res) {
    params = req.body
    var update = {
        $set: {
            group_id: params.group_id
        }
    }
    User.findOneAndUpdate({
            _id: params.user_id
        }, update, {
            safe: true,
            upsert: true
        },
        function(err, model) {
            if (err) {
                res.send(JSON.stringify({
                    status: "Error"
                }));
            }

        });
    res.send(JSON.stringify({
        status: 'success', group_name: params.group_name
    }));


    // if (params.user_id !== "undefined") {
    //     User.find({}).exec(function(err, users) {
    //         if (err) return next(err);
    //         _und.each(users, function(user) {
    //             if (!(_und.isEmpty(user.manage_user_ids))) {
    //                 var user_ids = _und.difference(user.manage_user_ids, [params.user_id]);
    //                 user.manage_user_ids = user_ids
    //             }
    //             user.save(function(err) {
    //                 if (err) return handleError(err);

    //             });
    //         });

    //     });
    //     var update = {
    //         $push: {
    //             manage_user_ids: params.user_id
    //         }
    //     }
    //     User.findOneAndUpdate({
    //             _id: params.moderator_id
    //         }, update, {
    //             safe: true,
    //             upsert: true
    //         },
    //         function(err, model) {
    //             if (err) {
    //                 res.send(JSON.stringify({
    //                     status: "Error"
    //                 }));
    //             }

    //             res.send(JSON.stringify({
    //                 status: 'success'
    //             }));

    //         });
    // }


});

router.post('/profile/:id/edit', isLoggedIn, isManager, function(req, res) {
    var user_params = req.body.user;

    User.findById(req.params.id, function(err, user) {
        if (err) return handleError(err);

        user.name = user_params.name;
        var date = new Date();
        date.setDate(date.getDate() + 1);
        user.updated_at = moment.tz(date.toISOString(), "Asia/Kolkata"); 
        //user.email = user_params.email;
        if (user_params.password != "") {
            user.password = user_params.password
        }
        if (typeof user_params.group_id !== "undefined" && typeof user_params.group_id != "") {
          user.group_id = user_params.group_id;    
        }
        if (typeof user_params.roles === "undefined") {
            user.roles = ['Analyst'];
        } else {
            user.roles = user_params.roles;
        }

        user.save(function(err) {
            if (err) return handleError(err);
        });
    });
    res.redirect("/users");
});

router.get('/users', isLoggedIn, isManager, function(req, res) {
    // User.find({}function (err, users) {
    //   if (err) return next(err);
    //   res.render('users/index', { user : req.user,  title: 'Google Ads', users: users });
    // });

    // var query = {
    //     "_id": id
    // };
    // var update = {
    //     name: {
    //         first: 'john',
    //         last: 'smith'
    //     }
    // };
    // var options = {
    //     new: true
    // };
    // People.findOneAndUpdate(query, update, options, function(err, person) {
    //     if (err) {
    //         console.log('got an error');
    //     }

    //     // at this point person is null.
    // });
    
    User.find({}).sort({
        created_at: -1
    }).exec(function(err, users) {
        if (err) return next(err);
        var groups = Group.find({});
        res.render('users/index', {
            user: req.user,
            title: 'Task',
            users: users,
            groups: groups
        });
    });
});


router.get('/get-moderator-lead-members', isLoggedIn, function(req, res) {
   // console.log(" req.query === >>>>>>>>>> ",req.query);
    var curren_role=req.query.user_role;
   var role={};
  
   if(curren_role.indexOf("Lead")!=-1){
   
        role={
               '$and': [
                     { "group_id":req.query.group_id },
                     { "is_active":true},
                     { '$or': [ 
                              // { "roles": ["Analyst"]},
                               { "roles": ["Moderator"]
                              } 
                            ] 
                       }


               ]

             }
         }

         if(curren_role.indexOf("Manager")!=-1){
   
        role={
               '$and': [
                     { "group_id":req.query.group_id },
                      { "is_active":true},
                     { '$or': [ 
                              // { "roles": ["Analyst"]},
                               { "roles": ["Moderator"]},
                               { "roles": ["Lead"]} 
                            ] 
                       }


               ]

             }
         }
       User.find(role).exec(function(err, users) {
    //    console.log("get-moderator-lead-members ",users);
        res.send({ users_name: users});
    });
   
});


router.get('/get-analyst-moderator-members', isLoggedIn, function(req, res) {
   // console.log(" req.query === >>>>>>>>>> ",req.query);
    var curren_role=req.query.user_role;
   var role={};
  
   if(curren_role.indexOf("Moderator")!=-1 || curren_role.indexOf("Lead")!=-1 || curren_role.indexOf("Manager")!=-1){
   
         role={
               '$and': [
                     { "group_id":req.query.group_id },
                      { "is_active":true},
                     { '$or': [ 
                               { "roles": ["Analyst"]},
                               { "roles": ["Moderator"]}
                               //{ "roles": ["Analyst"] } 
                            ] 
                       }


               ]

            
             }

                User.find(role).exec(function(err, users) {
    //    console.log("get-moderator-lead-members ",users);
        res.send({ users_name: users});
    });

   }

});

router.get('/stats', isLoggedIn, isManager, function(req, res) {

    if(req.query.id != undefined) {

        Group.find({}).exec(function(err, groups) {

            var fromDate = null;
            var toDate = null;
            var user_id = null;

            if(req.query.fromDate != undefined) {
                fromDate = new Date(req.query.fromDate).toLocaleDateString();
                toDate = new Date(req.query.toDate).toLocaleDateString();
                user_id = req.query.user_id;
            }

            var where = new Object({group_id : {$eq : req.query.id}});

            if(req.query.user_id != undefined) {
                where = new Object(
                        {
                            group_id : {$eq : req.query.id},
                            _id : {$eq : req.query.user_id}
                        }
                    );
            }

            User.find(where).exec(function(err, users) {

                var user_ids = new Array();
                var user_data = new Array();

                users.forEach(function(y) {
                    user_ids.push(y["_id"]);
                });


                User.find({ group_id : {$eq : req.query.id},
                             '$or': [
                                    {
                                        "roles": ["Analyst"]
                                    },
                                    {
                                        "roles": ["Moderator"]
                                    }]
                            }).exec(function(err, users1) {

                                var user_data = new Array();

                                users1.forEach(function(y) {
                                    user_data.push({id : y["_id"] , name : y["name"]});
                                });

                                var where1 = new Object({ user_id: { $in: user_ids }});

                                    
                                where1 = new Object({
                                    user_id: { $in: user_ids },
                                    created_at : {
                                        $gte: fromDate,
                                        $lt: toDate
                                    }
                                });
                                
                                Task.find(where1).exec(function(err, tasks) {

                                    var task_data = new Array();
                                    var taskCount = new Object();

                                    taskCount["checked"] = 0;
                                    taskCount["unchecked"] = 0;

                                    tasks.forEach(function(t) {
                                        if(t.is_correct != undefined) {
                                            taskCount["checked"]++;
                                            var temp = new Object();
                                            temp["is_correct"] = t.is_correct;
                                            temp["verifier_name"] = t.verifier_name;
                                            temp["user_name"] = t.user_name;
                                            task_data.push(temp);
                                        } else {
                                            taskCount["unchecked"]++;
                                        }
                                    });

                                    res.render('users/stats', {
                                        user: req.user,
                                        title: 'Statistics',
                                        groups: groups,
                                        group_id: req.query.id,
                                        tasks: task_data,
                                        task_count: taskCount,
                                        users: user_data,
                                        get_user_id: user_id,
                                        get_from_date: fromDate,
                                        get_to_date: toDate
                                    });
                                }); 
                            });
            });
        });

    } else {
        Group.find({}).sort({}).exec(function(err, groups) {
            res.render('users/stats', {
                user: req.user,
                title: 'Statistics',
                groups: groups
            });
        });    
    }

    
});



router.get('/get-groups-members', isLoggedIn, function(req, res) {
      User.find({"group_id":req.query.id}).exec(function(err, users) {
        res.send({ users_name: users});
    });
   
});

router.get('/get-groups', isLoggedIn, isManager, function(req, res) {
       Group.find({}).exec(function(err, groups) {
        res.send({ groups: groups});
    });
});


router.post('/role-update', isLoggedIn, isManager, function(req, res) {
    var params = req.body
    if (params.role == "Active") {
        if (params.status == "checked") {
            var update = {
                $set: {
                    is_active: true
                }
            }
        } else {
            var update = {
                $set: {
                    is_active: false
                }
            }
        }

        User.findOneAndUpdate({
                _id: params.user_id
            }, update, {
                safe: true,
                upsert: true
            },
            function(err, model) {
                if (err) {
                    res.send(JSON.stringify({
                        status: "Error"
                    }));
                }

                res.send(JSON.stringify({
                    status: params.status
                }));

            });
    } else {


        if (params.status == "checked") {
            var update = {
                $set: {
                    roles: [params.role]
                }
            }
        }

        User.findOneAndUpdate({
                _id: params.user_id
            }, update, {
                safe: true,
                upsert: true
            },
            function(err, model) {
                if (err) {
                    res.send(JSON.stringify({
                        status: "Error"
                    }));
                }

                res.send(JSON.stringify({
                    status: params.status
                }));

            });

    }
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.post('/search-by-name', function(req, res) {
    var params = req.body
    var regex = new RegExp(params.query, "i");
    User.find({
        "$or": [{
            "name": regex
        }, {
            "email": regex
        }]
    }).sort({
        created_at: -1
    }).exec(function(err, users) {
        res.render('users/search_by_name', {
            users: users,
            layout: false
        });
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function isManager(req, res, next) {
    if (_und.contains(req.user.roles, 'Manager'))
        return next();

    res.redirect('/');
}