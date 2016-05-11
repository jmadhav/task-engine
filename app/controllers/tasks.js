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

router.get('/upload', isLoggedIn, function(req, res) {
    res.render('tasks/upload', {
        user: req.user,
        title: 'Google Ads'
    });
});

router.post('/upload', uploading.single('file'), isLoggedIn, function(req, res) {
    var excelTaskData = readExcelFile(req.file.path)
    _und.each(excelTaskData, function(excelTask) {
        var task = new Task();
        task.user_id = req.user._id;
        task.task = JSON.stringify(excelTask);
        if (req.body.date !== "undefined") {
          task.created_at = new Date(req.body.date)
          task.updated_at = new Date(req.body.date)    
        }
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