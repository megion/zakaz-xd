var router = require('express').Router();

var userService = require('../service/userService');
var error = require('../error');
var HttpError = error.HttpError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;
var pagination = require('../utils/pagination');
var ObjectID = require('mongodb').ObjectID;

router.get('/all-users', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    //var user = req.user;
    var page = pagination.createMongodbPage(req);
    userService.findAllUsers(page, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/user-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    var userId = new ObjectID(req.param('userId'));

    userService.findWithRolesById(userId, function(err, user) {
            if (err) {
                return next(err);
            }
            res.json(user);
        }
    );
});

router.post('/create-user', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    var user = req.body;
    userService.createUser(user, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

router.post('/edit-user', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    var user = req.body;
    userService.createUser(user, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

module.exports = router;
