var router = require('express').Router();

var userService = require('../service/userService');
var error = require('../error');
var HttpError = error.HttpError;
var AuthError = error.AuthError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;

router.get('/all-users', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    var user = req.user;
    var page = {itemsPerPage: parseInt(req.params('itemsPerPage')), page: parseInt(req.params('page'))};

    console.log("page0", page);

    userService.findAllUsers(page, function(err, users) {
            if (err) {
                return next(err);
            }
            res.json(users);
        }
    );
});

router.get('/user-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_USERS), function(req, res, next) {
    var user = req.user;

    userService.findWithRolesById(function(err, user) {
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

module.exports = router;
