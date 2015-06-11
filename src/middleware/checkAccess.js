var HttpError = require('error').HttpError;
var userService = require('service/userService');
var log = require('lib/log')(module);
var ObjectID = require('mongodb').ObjectID;

function getAuditor(access) {
    return function(req, res, next) {
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

        // получить пользователя и проверить доступ
        userService.findWithRolesById(userId, function(err, user) { // ObjectID
            if (err)
                return next(err);
            if (!user) {
                return next(new HttpError(404, "Текущий пользователь не найден"));
            }

            if(!userService.isAuthorize(user, access)) {
                return next(new HttpError(403, "У вас нет прав доступа к данному ресурсу"));
            }

            next();
        });


    };
}

exports.getAuditor = getAuditor;