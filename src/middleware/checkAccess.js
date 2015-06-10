var HttpError = require('error').HttpError;

function checkAccess(access) {
    return function(req, res, next) {
        if (!req.session.user) {
            return next(new HttpError(401, "Вы не авторизованы"));
        }

        // получить пользователя и проверить доступ

        next();
    };
}

exports.checkAccess = checkAccess;