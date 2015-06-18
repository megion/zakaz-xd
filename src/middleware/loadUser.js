var HttpError = require('error').HttpError;
var userService = require('service/userService');
var log = require('lib/log')(module);
var ObjectID = require('mongodb').ObjectID;

module.exports = function(req, res, next) {
	req.user = null;

    if (!req.session.user) {
        return next(new HttpError(401, "Пользователь не авторизован"));
    }

    var userId;
    try {
        userId = new ObjectID(req.session.user);
    } catch (e) {
        log.error(e.message);
        next(e);
        return;
    }

    // получить пользователя с ролями
    userService.findWithRolesById(userId, function(err, user) { // ObjectID
        if (err)
            return next(err);
        if (!user) {
            return next(new HttpError(404, "Текущий пользователь не найден"));
        }

        req.user = user;
        next();
    });
};