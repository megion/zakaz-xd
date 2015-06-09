var router = require('express').Router();
var error = require('error');
var HttpError = error.HttpError;
var AuthError = error.AuthError;
var userService = require('service/userService');
var log = require('lib/log')(module);

router.post("/", function(req, res, next) {
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

module.exports = router;
