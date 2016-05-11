var express = require('express'),
    router = express.Router();
mongoose = require('mongoose');
User = mongoose.model('User');
Group = mongoose.model('Group');
_und = require("underscore");

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
            title: 'Google Ads',
            groups: groups
        });
    });
});

router.get('/new-groups', isLoggedIn, isManager, function(req, res) {
    res.render('groups/new_group', {
        user: req.user,
        title: 'Google Ads'
    });
});


router.post('/new-groups', isLoggedIn, isManager, function(req, res) {
    var group_params = req.body.group;
    var group = new Group();
    if (group_params.name !== 'undefined') {
        group.name = group_params.name
        group.save(function(err) {
            if (err)
                throw err;
        });
    }

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