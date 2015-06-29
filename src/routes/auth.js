var router = require('express').Router();

var userService = require('../service/userService');
var error = require('../error');
var HttpError = error.HttpError;
var AuthError = error.AuthError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;

router.get('/current-user', loadUser, function(req, res, next) {
    // удалим лишнюю информацию
    var user = req.user;
    delete user.hashedPassword;
    delete user.salt;
    delete user.password;

    res.json(user);
});

router.get('/is-authenticated', function(req, res, next) {
    if (req.session && req.session.user) {
        return res.json(true);
    } else {
        return res.json(false);
    }
});

router.post('/change-password', loadUser, checkAccess.getAuditor(ACCESSES.CHANGE_OWN_PASSWORD), function(req, res, next) {
    var newPassword = req.body.newPassword;
    var repeatNewPassword = req.body.repeatNewPassword;

    if (!newPassword || newPassword.length===0) {
        return next(new HttpError(400, "Пароль не может быть пустым"));
    }

    if (newPassword !== repeatNewPassword) {
        return next(new HttpError(400, "Пароли не сопадают"));
    }

    userService.changeUserPassword(req.user._id, newPassword, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

router.post('/save-user', loadUser, function(req, res, next) {
    var user = req.body.user;
    var userCopy = {
        email: user.email
    };
    userService.changeUser(req.user._id, userCopy, function(err) {
        if (err)
            return next(err);

        res.send({});
    });
});

router.post("/login", function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    userService.authorize(username, password, function(err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        if (user.locked) {
            return next(new HttpError(403, "Пользователь заблокирован"));
        }

        req.session.user = user._id;
        log.info("User success login ID " + req.session.user);
        res.send({});

    });
});

router.post("/logout", function(req, res) {
    log.info("Destroy user session ID " + req.session.user);
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
