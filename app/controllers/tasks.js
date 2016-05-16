var express = require('express'),
    router = express.Router();
    mongoose = require('mongoose');
    Task = mongoose.model('Task');
    _und = require("underscore");
    multer = require('multer');
    findRemoveSync = require('find-remove');
    XLSX = require('xlsx');

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
        title: 'Google Ads'
    });
});
router.post('/view_task', isLoggedIn, function(req, res) {
        var fromDate= new Date(req.body.fromDate).toLocaleDateString();
        var toDate= new Date(req.body.toDate).toLocaleDateString();
         search_Data={  
         "$and": [{
                     "user_id": req.body.user_id,
                 },
                  
                  { "created_at": {
                         $gte:fromDate,
                         $lt:toDate
                           }
                   }


               ]
           }


           Task.find(search_Data).exec(function(err, tasks) {
                  res.render('tasks/view_task', { tasks : tasks,user:req.user,  title: 'Google Ads' });
                });

         });

router.get('/upload', isLoggedIn, function(req, res) {
    res.render('tasks/upload', {
        user: req.user,
        title: 'Google Ads'
    });
});

router.post('/upload', uploading.single('file'), isLoggedIn, function(req, res) {
   //  console.log(req.file)
   // var d = new Date(req.body.date).toLocaleDateString();
   var d=req.body.date;
  console.log(new Date(d).toLocaleDateString());
    var task_ids = []
    var excelTaskData = readExcelFile(req.file.path);
    _und.each(excelTaskData, function(excelTask) {
        var task = new Task(excelTask);
        task.user_id = req.user._id;
        task.user_name=req.user.name;
        task.created_at= new Date(d).toLocaleDateString();
      //  task.updated_at=new Date(req.body.date).toLocaleDateString();
        task.save(function(err) {
            if (err)
                throw err;
        });
    });
    findRemoveSync(process.cwd() + '/tmp/', {
        extensions: ['.xlsx']
    });
    res.render('users/profile', {
        user: req.user,
        title: 'Google Ads'
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}


router.post('/update_data',isLoggedIn,function(req, res) {
//console.log("supdate_data ",req.body.tabledata);
var data=req.body.tabledata;

for(var i in data){

    var id=data[i]["_id"];
    console.log(id);

     Task.update({_id:id},data[i]).exec(function(err) {
     if (err)
      throw err;
     
    });

}

 res.render('users/profile', { title: 'Google Ads' });
  

 
});


router.post('/search_task', isLoggedIn, function(req, res) {
//console.log("search_task from Date",req.body);
console.log("search_task from User",req.body);
var ipData;
var search_Data={};
var fromDate= new Date(req.body.fromDate).toLocaleDateString();
var toDate= new Date(req.body.toDate).toLocaleDateString();

 if(req.body.selecte_user_role=='Analyst'){
                ipData=req.body.user_name;
                 search_Data={  
                     "$and": [{
                                 "user_id": ipData,
                             },
                              
                              { "created_at": {
                                     $gte:fromDate,
                                     $lt:toDate
                                       }
                               }


                           ]
                       }
        
         }else{
            console.log("both ar same22")  
                     ipData=req.body.user_name;
                     search_Data={  
                         "$and": [{
                                     "verifier_id": ipData,
                                 },
                                  
                                  { "created_at": {
                                         $gte:fromDate,
                                         $lt:toDate
                                           }
                                   }


                               ]
                           }

         }
   


Task.find(search_Data).exec(function(err, tasks) {
     console.log("Task === "+tasks);
      res.render('users/profile', { tasks : tasks,user:req.user,  title: 'Google Ads' });
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