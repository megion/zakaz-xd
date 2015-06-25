var HttpError = require('../error').HttpError;
var userService = require('../service/userService')

function getAuditor(access) {
    return function(req, res, next) {
        if (!req.user) {
            return next(new Error("User in null"));
        }

        if(!userService.isAuthorize(req.user, access)) {
            return next(new HttpError(403, "У вас нет прав доступа к данному ресурсу"));
        }

        next();
    };
}

exports.getAuditor = getAuditor;