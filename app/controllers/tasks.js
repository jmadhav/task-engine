var express = require('express'),
    router = express.Router();
mongoose = require('mongoose');
Task = mongoose.model('Task');
_und = require("underscore");
multer = require('multer');
findRemoveSync = require('find-remove');
XLSX = require('xlsx');
var moment = require('moment-timezone');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, process.cwd() + '/tmp/')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.xlsx')
    }
})

var uploading = multer({
    storage: storage
})

module.exports = function(app) {
    app.use('/', router);
};

router.get('/view_task', isLoggedIn, function(req, res) {
    res.render('tasks/view_task', {
        user: req.user,
        title: 'Task Engine'
    });
});

router.get('/audit_task', isLoggedIn, function(req, res) {
    res.render('tasks/audit_task', {
        user: req.user,
        title: 'Audit Task'
    });
});


router.post('/view_only_task', isLoggedIn, function(req, res) {
    var date = {};
     var view_Data = null;
    if ((req.body.fromDate.length <= 0) || (req.body.toDate.length <= 0)) {

        date = {
           "created_at": {"$gte": new Date().setHours(0,0,0,0)}

        }
    } else {
        var fromDate = new Date(req.body.fromDate).setHours(0,0,0,0);
        var toDate = new Date(req.body.toDate).setHours(23,59,59,999);
        date = {
            "created_at": {
                $gte: fromDate,
                $lt: toDate
            }
        }
    }

       view_Data = {
            "$and": [{
                "user_id": req.body.user_id
            }, {'$or': [{
                                    "is_correct": true
                                }, {
                                    "is_correct": false
                                }
                          ]},date]
        }

      page = req.param('page') > 0 ? req.param('page') : 1
      Task.paginate(view_Data, { page: page, limit: 10 }, function(err, result) {
        res.render('tasks/search_task', {
                tasks: result.docs,
                page: result.page,
                pages: result.pages,
                req: req,
                layout: false
            });
      });

});
router.post('/audit_task', isLoggedIn, function(req, res) {
    console.log(" first =======",req.body.user_group_id);
   var date = {}
    if ((req.body.fromDate.length <= 0) || (req.body.toDate.length <= 0)) {

         date = {
            "created_at": {"$gte": new Date().setHours(0,0,0,0)}
        }
    } else {
        var fromDate = new Date(req.body.fromDate).setHours(0,0,0,0);
        var toDate = new Date(req.body.toDate).setHours(23,59,59,999);
        date = {
            "created_at": {
                $gte: fromDate,
                $lt: toDate
            }
        }
    }
   search_Data = {
            "$and": [{
                "user_group_id": req.body.user_group_id
            },{
                "is_audit_task": true
            }, date]
        }

     page = req.param('page') > 0 ? req.param('page') : 1
    Task.paginate(search_Data, { page: page, limit: 10 }, function(err, result) {
        console.log("result ",result);
        res.render('tasks/audit_search_task', {
                tasks: result.docs,
                page: result.page,
                pages: result.pages,
                req: req,
                user: req.user,
                layout: false
        });
    });


});

router.post('/audit_task1', isLoggedIn, function(req, res) {

   var isPending=req.body.isPending;
    var search_Data = null;
    /* creating and modifying date as per IP*/
    var date = {}
    if ((req.body.fromDate.length <= 0) || (req.body.toDate.length <= 0)) {

         date = {
            "created_at": {"$gte": new Date().setHours(0,0,0,0)}
        }
    } else {
        var fromDate = new Date(req.body.fromDate).setHours(0,0,0,0);
        var toDate = new Date(req.body.toDate).setHours(23,59,59,999);
        date = {
            "created_at": {
                $gte: fromDate,
                $lt: toDate
            }
        }
    }
    if (req.body.user_role == 'Analyst') {
       
        search_Data = {
            "$and": [{
                "user_id": req.body.user_id
            }, date]
        }

    } else if (req.body.user_role.indexOf('Moderator') != -1) {


        if (req.body.selecte_user_role.length <= 0) { //No Aanalyst selected from list ..Then search for moderator task only
             if(isPending=="true"){

                       search_Data = {
                                        "$and": [{
                                            "user_id": req.body.user_id
                                        }, 
                                         {'$or': [{
                                                        "verifier_id": null
                                                    }, {
                                                        "verifier_comments": null
                                                    },{

                                                         "is_correct": null
                                                    }

                                                ]}, date]
                                     }

             }else {
                       search_Data = {
                        "$and": [{
                            "user_id": req.body.user_id
                        }, date]
                      }

             }


         
        } else {

                if(isPending=="true"){
                             search_Data = {
                                    '$and': [{
                                            "user_id": req.body.selected_user_id
                                        },

                                        {
                                            '$or': [{"verifier_id": null }, {"verifier_comments": null},{"is_correct": null}

                                            ]
                                        },
                                        date
                                         ]

                                }


                 }else {

                            search_Data = {
                                            '$and': [{
                                                    "user_id": req.body.selected_user_id
                                                },

                                                {
                                                    '$or': [{
                                                            "verifier_id": req.body.user_id
                                                        }, {
                                                            "verifier_id": null
                                                        }

                                                    ]
                                                },
                                                date
                                                  ]

                                          }

                        }


        }

    } else if (req.body.user_role.indexOf('Lead') != -1 || req.body.user_role.indexOf('Manager') != -1) {

        if ((typeof req.body.selected_user_id != 'undefined' &&  req.body.selected_user_id.length<=0) && (typeof req.body.selected_viewer_id != 'undefined' &&  req.body.selected_viewer_id.length<=0)) {
                 if(isPending=="true"){

                     search_Data = {
                                        "$and": [{
                                            "user_id": req.body.user_id
                                        }, 
                                         {'$or': [{
                                                        "verifier_id": null
                                                    }, {
                                                        "verifier_comments": null
                                                    },{

                                                         "is_correct": null
                                                    }

                                                ]}, date]
                                     }
                 }else {
                          search_Data = {
                                            '$and': [{
                                                "user_id": req.body.user_id
                                            }, date]

                                        }

                 }

          
        } else if ((typeof req.body.selected_user_id != 'undefined' &&  req.body.selected_user_id.length>0) && (typeof req.body.selected_viewer_id != 'undefined' &&  req.body.selected_viewer_id.length <=0)) {
                 if(isPending=="true"){
                             search_Data = {
                                        "$and": [{
                                            "user_id": req.body.selected_user_id
                                        }, 
                                         {'$or': [{
                                                        "verifier_id": null
                                                    }, {
                                                        "verifier_comments": null
                                                    },{

                                                         "is_correct": null
                                                    }

                                                ]}, date]
                                     }

                 }else{

                                search_Data = {
                                                    '$and': [{
                                                        "user_id": req.body.selected_user_id
                                                    }, date]

                                                }

                 }

        
        } else if ((typeof req.body.selected_viewer_id != 'undefined' &&  req.body.selected_viewer_id.length>0) && (typeof req.body.selected_user_id != 'undefined' &&  req.body.selected_user_id.length <= 0) ) {
           
        if(isPending=="true"){

                                search_Data = {
                                                    '$and': [{
                                                        "verifier_id": req.body.selected_viewer_id
                                                    } ,{'$or': [{
                                                                    "verifier_id": null
                                                                }, {
                                                                    "verifier_comments": null
                                                                },{

                                                                     "is_correct": null
                                                                }

                                                            ]}, date]

                                         }


                }else {
                                search_Data = {
                                    '$and': [{
                                        "verifier_id": req.body.selected_viewer_id
                                    }, date]

                         }
          }
        } else if ((typeof req.body.selected_viewer_id != 'undefined' &&  req.body.selected_viewer_id.length > 0) && (typeof req.body.selected_user_id != 'undefined' &&  req.body.selected_user_id.length > 0)) {
          
                            if(isPending=="true"){

                                               search_Data = {
                                                    "$and": [{
                                                        "user_id": req.body.selected_user_id
                                                    }, {
                                                            "verifier_id": req.body.selected_viewer_id
                                                         },
                                                     {'$or': [  {
                                                                    "verifier_comments": ""
                                                                },{
                                                                    "verifier_comments": null
                                                                },{

                                                                     "is_correct": null
                                                                }

                                                            ]}, date]
                                                 }


                            }else{

                                                 search_Data = {
                                                            '$and': [{
                                                                "user_id": req.body.selected_user_id
                                                            }, {
                                                                "verifier_id": req.body.selected_viewer_id
                                                            }, date]
                                                    }


                                    }

                 }

      
    }

    /* creating and modifying search_Data as per IP params */

    page = req.param('page') > 0 ? req.param('page') : 1
    Task.paginate(search_Data, { page: page, limit: 10 }, function(err, result) {
        res.render('tasks/audit_search_task', {
                tasks: result.docs,
                page: result.page,
                pages: result.pages,
                req: req,
                user: req.user,
                layout: false
        });
    });

});

router.get('/upload', isLoggedIn, function(req, res) {
    res.render('tasks/upload', {
        user: req.user,
        title: 'Task Engine'
    });
});

router.post('/upload', uploading.single('file'), isLoggedIn, function(req, res) {
  //  console.log("upload============",req.body.user_group_id);
   
   
    // var d = new Date(req.body.date).toLocaleDateString();
    var d = new Date(req.body.date);
    var task_ids = []
    var excelTaskData = readExcelFile(req.file.path);
    var tasks_count = excelTaskData.length;
    _und.each(excelTaskData, function(excelTask) {
        var task = new Task(excelTask);
        task.user_id = req.user._id;
        task.user_group_id=req.body.user_group_id;
        task.user_name = req.user.name;
        task.verifier_id = null;
        task.created_at = moment.tz(d, "Asia/Kolkata");
        task.updated_at = moment.tz(d, "Asia/Kolkata");
        //  task.updated_at=new Date(req.body.date).toLocaleDateString();
        task.save(function(err) {
            if (err)
                throw err;
        });
    });
    
    var fromDate = new Date(d).setHours(0,0,0,0);
    var toDate = new Date(d).setHours(23,59,59,999);

    date = {
      "created_at": {
         $gte: fromDate,
         $lt: toDate
      }
    }
    
    Task.find({"$and": [{ "user_id": req.user._id }, date]}).exec(function(err, tasks) {
      if(err){
        console.log(err);
      }
      _und.each(tasks, function(task) {
        Task.update({ _id: task._id }, { $set: { is_audit_task: false }}, { multi: true }, function (error){
          if(error){
            console.error('ERROR!');
          }
        });  
      });
      
      var number_of_records = Math.round(((15 * tasks.length)/100));
      Task.aggregate([{ '$sample': { size:  number_of_records}}]).exec(function(err, samplingTask) {
        if (err) {
          console.log(err);    
        }
        _und.each(samplingTask, function(task) {
          Task.update({ _id: task._id }, { $set: { is_audit_task: true }}, { multi: true }, function (error){
            if(error){
              console.error('ERROR!');
            }
          });  
        }); 
      });
    });      
    
    findRemoveSync(process.cwd() + '/tmp/', {
        extensions: ['.xlsx']
    });
    res.send({
        status: 'success',
        tasks_count: tasks_count
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}


router.post('/update_data', isLoggedIn, function(req, res) {
    var data = req.body.tabledata;
    //var user=req.body.user;

    for (var i in data) {

        var id = data[i]["_id"];
        // console.log(id);

        Task.update({
            _id: id
        }, data[i]).exec(function(err) {
            if (err)
                throw err;

        });

    }

    res.send({
        status: 'success'
    });

});

function readExcelFile(filePath) {
    var workbook = XLSX.readFile(filePath);
    var sheet_name_list = workbook.SheetNames;
    var fileData = [];
    sheet_name_list.forEach(function(y) {
        var headers = [];
        var sheet = workbook.Sheets[y];
        var range = XLSX.utils.decode_range(sheet['!ref']);
        var C, R = range.s.r;
        for (C = range.s.c; C <= range.e.c; ++C) {
            var cell = sheet[XLSX.utils.encode_cell({
                c: C,
                r: R
            })];
            if (cell && cell.t) {
                hdr = XLSX.utils.format_cell(cell);
            }
            headers.push(hdr);
        }

        fileData = XLSX.utils.sheet_to_json(workbook.Sheets[y]);
        if (fileData.length > 0) {
            fileData.forEach(function(row) {
                // Set empty cell to ''.
                headers.forEach(function(hd) {
                    if (row[hd] === 'undefined') {
                        row[hd] = '';
                    }

                });
            });
        }
    });
    return fileData
}