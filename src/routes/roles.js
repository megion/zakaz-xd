var router = require('express').Router();

var roleService = require('../service/roleService');
var error = require('../error');
var HttpError = error.HttpError;
var AuthError = error.AuthError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;

router.get('/all-roles', loadUser, checkAccess.getAuditor(ACCESSES.VIEW_ROLES), function(req, res, next) {
    var user = req.user;

    roleService.findAllRolesWithAccesses(function(err, roles) {
            if (err) {
                return next(err);
            }
            res.json(roles);
        }
    );
});

module.exports = router;
