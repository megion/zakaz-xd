var router = require('express').Router();
var userService = require('service/userService');
var error = require('error');
var HttpError = error.HttpError;
var AuthError = error.AuthError;
var ObjectID = require('mongodb').ObjectID;
var log = require('lib/log')(module);
var checkAccess = require('middleware/checkAccess');
var ACCESSES = require('utils/accesses').ACCESSES;

router.get('/current-user', function(req, res, next) {
    if (!req.session || !req.session.user) {
        next(new HttpError(401, "Пользователь не авторизован"));
        return;
    }

    var userId;
    try {
        userId = new ObjectID(req.session.user);
    } catch (e) {
        log.error(e.message);
        next(new HttpError(404, "Текущий пользователь не найден"));
        return;
    }

    userService.findWithRolesById(userId, function(err, user) { // ObjectID
        if (err)
            return next(err);
        if (!user) {
            return next(new HttpError(404, "Текущий пользователь не найден"));
        }

        // удалим лишнюю информацию
        delete user.hashedPassword;
        delete user.salt;
        delete user.password;

        res.json(user);
    });
});

router.get('/is-authenticated', function(req, res, next) {
    if (req.session && req.session.user) {
        return res.json(true);
    } else {
        return res.json(false);
    }
});

router.post('/change-password', checkAccess.getAuditor(ACCESSES.CHANGE_OWN_PASSWORD), function(req, res, next) {
    var newPassword = req.body.newPassword;
    var repeatNewPassword = req.body.repeatNewPassword;

    if (!newPassword || newPassword.length===0) {
        return next(new HttpError(400, "Пароль не может быть пустым"));
    }

    if (newPassword !== repeatNewPassword) {
        return next(new HttpError(400, "Пароли не сопадают"));
    }

    var userId;
    try {
        userId = new ObjectID(req.session.user);
    } catch (e) {
        log.error(e.message);
        next(new HttpError(404, "Текущий пользователь не найден"));
        return;
    }

    userService.changeUserPassword(userId, newPassword, function(err) {
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
