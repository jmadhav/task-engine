var express = require('express'),
    router = express.Router();
mongoose = require('mongoose');
TaskReport = mongoose.model('TaskReport');
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

router.get('/upload_performance_sheet', isLoggedIn, isManager, function(req, res) {
    res.render('tasks/upload_add_task', {
        user: req.user,
        title: 'Task Engine'
    });
});


router.post('/upload_performance_sheet', uploading.single('file'), isLoggedIn, function(req, res) {
    var excelTaskData = readExcelFile(req.file.path);
    var tasks_count = excelTaskData.length;
    var d = new Date(req.body.date);
    _und.each(excelTaskData, function(excelTask) {
        var task_report = new TaskReport(excelTask);
        task_report.created_at = moment.tz(d, "Asia/Kolkata");
        task_report.save(function(err) {
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
});

router.get('/performance_dashboard', isLoggedIn, isManager, function(req, res) {
    res.render('tasks/performance_dashboard', {
        user: req.user,
        title: 'Performance Dashboard',
    });
});

router.get('/performance_chart', isLoggedIn, isManager, function(req, res) {
    if (req.query.fromDate != undefined) {
        var fromDate = new Date(req.query.fromDate).setHours(0, 0, 0, 0);
        var toDate = new Date(req.query.toDate).setHours(23, 59, 59, 999);
    } else {
        var date = new Date();
        var dateFromString = dateFormat((new Date(date.setDate(date.getDate() - 6))), "fullDate")
        var dateToString = dateFormat((new Date), "fullDate")
        var fromDate = new Date(dateFromString).setHours(0, 0, 0, 0);
        var toDate = new Date(dateToString).setHours(23, 59, 59, 999);
    }
    var data = [];
    var a = moment(dateFromString);
    var b = moment(dateToString);
    var diffdays = a.diff(b, 'days') + 1;
    console.log('diffdays');
    console.log(diffdays);

    date = {
        "created_at": {
            $gte: fromDate,
            $lt: toDate
        }
    }

    TaskReport.find(date).exec(function(err, task_reports) {
      var data = performanceData(task_reports, diffdays) 
      res.send({
        performanceData: data
      });
        
    });
});

router.get('/weekly_performance_chart', isLoggedIn, isManager, function(req, res) {
    var data = []
    var date = new Date();
    var dateFromString = dateFormat((new Date(date.setDate(date.getDate() - 6))), "fullDate")
    var dateToString = dateFormat((new Date), "fullDate")
    var fromDate = new Date(dateFromString).setHours(0, 0, 0, 0);
    var toDate = new Date(dateToString).setHours(23, 59, 59, 999);

    date = {
        "created_at": {
            $gte: fromDate,
            $lt: toDate
        }
    }
    TaskReport.find(date).limit(50000).exec(function(err, task_reports) {
      var data = weeklyPerformanceData(task_reports) 
      res.send({
        weeklyData: data
      });
        
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

function weeklyPerformanceData(task_reports){
  if (task_reports.length > 0)	{
    var totalAdsRated = task_reports.length
    var uniqueUser = _und.uniq(_und.map(task_reports, function(t) { return t.Ldap; }));
    var averageAdsPreSearchAnalyst = Math.round((totalAdsRated / uniqueUser.length));
    var averageHoursbyAnalyst = 8
    var averageProductivity = Math.round((totalAdsRated / (uniqueUser.length * (8 * 7) )));
    return [totalAdsRated, averageAdsPreSearchAnalyst, averageHoursbyAnalyst, averageProductivity ]
  } else {
    return [0, 0, 0, 0]
  }
}

function performanceData(task_reports, days){
  if (task_reports.length > 0)	{
    var totalAdsRated = task_reports.length
    var uniqueUser = _und.uniq(_und.map(task_reports, function(t) { return t.Ldap; }));
    var averageProductivity = Math.round((totalAdsRated / (uniqueUser.length * (8 * days) )));
    var users = _und.groupBy(task_reports, function(t) { return t.Name; })
    var usersProductivity = []
    _und.mapObject(users, function(val, key) {
      if (key != ' ' && key != '\\' && key != '' && key != 'Name') {
      	var userProductivity = Math.round((val.length / (8 * days)));
        return usersProductivity.push([key, userProductivity])
      }
    });
    return { all: averageProductivity, usersProductivity: usersProductivity };
  } else {
    return { all: 0, users: [["", 0], ["", 0]]}
  }
}

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