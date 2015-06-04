var router = require('express').Router();
var userService = require('service/userService');
var HttpError = require('error').HttpError;
var ObjectID = require('mongodb').ObjectID;
var log = require('lib/log')(module);

/* GET users listing. */
//router.get('/', function(req, res, next) {
//	User.find({}, function(err, users) {
//		if (err)
//			return next(err);
//		res.json(users);
//	})
//});
//
//router.get('/user/:id', function(req, res, next) {
//	try {
//		var id = new ObjectID(req.params.id);
//	} catch (e) {
//		log.error(e.message);
//		next(404);
//		return;
//	}
//
//	User.findById(id, function(err, user) { // ObjectID
//		if (err)
//			return next(err);
//		if (!user) {
//			return next(404);
//		}
//		res.json(user);
//	});
//});

router.get('/current', function(req, res, next) {
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

    userService.findById(userId, function(err, user) { // ObjectID
        if (err)
            return next(err);
        if (!user) {
            return next(new HttpError(404, "Текущий пользователь не найден"));
        }
        res.json(user);
    });
});

module.exports = router;
