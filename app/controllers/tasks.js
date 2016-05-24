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

module.exports = function(app, passport) {
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
        title: 'Task Engine'
    });
});


router.post('/view_only_task', isLoggedIn, function(req, res) {
    console.log("view_only_task === ",req.body);
    var date = {};
     var view_Data = null;
    if ((req.body.fromDate.length <= 0) || (req.body.toDate.length <= 0)) {

        date = {
            "created_at": new Date().toLocaleDateString()
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
            }, date]
        }

    Task.find(view_Data).exec(function(err, tasks) {
        res.render('tasks/search_task', {
            tasks: tasks,
            user: req.user,
            layout: false
        });
    });

    });


router.post('/audit_task', isLoggedIn, function(req, res) {
    console.log("view_task req == ",req.body);
   var isPending=req.body.isPending;
    var search_Data = null;

    /* creating and modifying date as per IP*/
    var date = {}
    if ((req.body.fromDate.length <= 0) || (req.body.toDate.length <= 0)) {

        date = {
            "created_at": new Date().toLocaleDateString()
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
             if(isPending){

                       search_Data = {
                "$and": [{
                    "user_id": req.body.user_id
                }, 
                 {"verifier_comments": ""},date]
            }

             }else {
                   search_Data = {
                    "$and": [{
                        "user_id": req.body.user_id
                    }, date]
                  }

             }


         
        } else {

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

    } else if (req.body.user_role.indexOf('Lead') != -1 || req.body.user_role.indexOf('Manager') != -1) {

        if (typeof req.body.selected_user_id == 'undefined' && typeof req.body.selected_viewer_id == 'undefined') {

            search_Data = {
                '$and': [{
                    "verifier_id": req.body.user_id
                }, date]

            }
        } else if (typeof req.body.selected_user_id != 'undefined') {


            search_Data = {
                '$and': [{
                    "user_id": req.body.selected_user_id
                }, date]

            }
        } else if (typeof req.body.selected_viewer_id != 'undefined') {
            search_Data = {
                '$and': [{
                    "verifier_id": req.body.selected_viewer_id
                }, date]

            }
        } else if (typeof req.body.selected_user_id != 'undefined' && typeof req.body.selected_viewer_id != 'undefined') {
            search_Data = {
                '$and': [{
                    "user_id": req.body.selected_user_id
                }, {
                    "verifier_id": req.body.selected_viewer_id
                }, date]
            }

        }

        /*  search_Data={
                 '$or': [
                       { "user_id":req.body.selected_user_id},
                       
                       { '$or': [ 
                                 { "verifier_id":req.body.selected_viewer_id},
                                 { "verifier_id":req.body.user_id}
                                
                              ] 
                         },date


                 ]

               }*/

    }

    console.log("search_Data == ",search_Data)
    /* creating and modifying search_Data as per IP params */




    Task.find(search_Data).exec(function(err, tasks) {
        res.render('tasks/search_task', {
            tasks: tasks,
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
    //  console.log(req.file)
    // var d = new Date(req.body.date).toLocaleDateString();
    var d = req.body.date;
    console.log(new Date(d).toLocaleDateString());
    var task_ids = []
    var excelTaskData = readExcelFile(req.file.path);
    var tasks_count = excelTaskData.length;
    _und.each(excelTaskData, function(excelTask) {
        var task = new Task(excelTask);
        task.user_id = req.user._id;
        task.user_name = req.user.name;
        task.verifier_id = null;
        task.created_at = moment.tz(d, "Asia/Kolkata");
        task.updated_at = moment.tz(d, "Asia/Kolkata");
        console.log( 'created_at' + created_at)
        //  task.updated_at=new Date(req.body.date).toLocaleDateString();
        task.save(function(err) {
            if (err)
                throw err;
        });
    });
    findRemoveSync(process.cwd() + '/tmp/', {
        extensions: ['.xlsx']
    });
    res.send({
        status: 'success',
        tasks_count: tasks_count
    });
    /* res.render('users/profile', {
         user: req.user,
         title: 'Task',
         message: "Your task has been uploaded"
     });*/
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}


router.post('/update_data', isLoggedIn, function(req, res) {
    //console.log("supdate_data >>>>>>>>>>>>>>>>>> ",req.body);
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