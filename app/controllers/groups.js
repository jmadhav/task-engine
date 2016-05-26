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

    Group.find({}, function(err, groups) {
        if (err) { /*error!!!*/ }
        User.find({}, function(err, users) {
            if (err) { /*error!!!*/ }
            res.render('groups/index', {
              user: req.user,
              title: 'Groups',
              users: users,
              groups: groups
            });
        });
    });

    

});

router.get('/new-groups', isLoggedIn, isManager, function(req, res) {
    res.render('groups/new_group', {
        user: req.user,
        title: 'Group'
    });
});


router.post('/new-groups', isLoggedIn, isManager, function(req, res) {
    var group_params = req.body.group;
    var group = new Group();
    if (group_params.name !== 'undefined') {
        group.name = group_params.name
        var date = new Date();
        date.setDate(date.getDate() + 1);
        group.created_at = moment.tz(date.toISOString(), "Asia/Kolkata");
        group.updated_at = moment.tz(date.toISOString(), "Asia/Kolkata");
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
            title: 'Group'
        });
    });
});

router.post('/group/:id/edit', isLoggedIn, isManager, function(req, res) {
    var group_params = req.body.group;

    Group.findById(req.params.id, function(err, group) {
        if (err) return handleError(err);

        group.name = group_params.name;
        var date = new Date();
        date.setDate(date.getDate() + 1);
        group.updated_at = moment.tz(date.toISOString(), "Asia/Kolkata");
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