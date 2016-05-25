var express = require('express'),
    router = express.Router();
mongoose = require('mongoose');
User = mongoose.model('User');
Group = mongoose.model('Group');
_und = require("underscore");
moment = require('moment-timezone');

module.exports = function(app, passport) {
    app.use('/', router);
};

router.get('/groups', isLoggedIn, isManager, function(req, res) {
    Group.find({}).sort({
        created_at: -1
    }).exec(function(err, groups) {
        if (err) return next(err);
        res.render('groups/index', {
            user: req.user,
            title: 'Task',
            groups: groups
        });
    });
});

router.get('/new-groups', isLoggedIn, isManager, function(req, res) {
    res.render('groups/new_group', {
        user: req.user,
        title: 'Task'
    });
});


router.post('/new-groups', isLoggedIn, isManager, function(req, res) {
    var group_params = req.body.group;
    var group = new Group();
    if (group_params.name !== 'undefined') {
        group.name = group_params.name
        group.created_at = moment.tz(new Date().toLocaleDateString(), "Asia/Kolkata");
        group.updated_at = moment.tz(new Date().toLocaleDateString(), "Asia/Kolkata");
        group.save(function(err) {
            if (err)
                throw err;
        });
    }
    res.redirect("/groups");
});

router.get('/group/:id/edit', isLoggedIn, isManager, function(req, res) {
    var id = req.params.id
    Group.findById(id, function(err, group) {
        if (err) return next(err);
        res.render('groups/edit_group', {
            group: group,
            user: req.user,
            title: 'Task'
        });
    });
});

router.post('/group/:id/edit', isLoggedIn, isManager, function(req, res) {
    var group_params = req.body.group;

    Group.findById(req.params.id, function(err, group) {
        if (err) return handleError(err);

        group.name = group_params.name;
        group.updated_at = moment.tz(new Date().toLocaleDateString(), "Asia/Kolkata");


        group.save(function(err) {
            if (err) return handleError(err);
        });
    });
    res.redirect("/groups");
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