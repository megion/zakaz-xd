var userService = require('service/userService');
var mongodb = require('lib/mongodb');

module.exports = function(req, res, next) {

	req.user = null;

	if (!req.session.user)
		return next();

	mongodb.findById(req.session.user, userService.getCollection(), function(err, user) {
		if (err)
			return next(err);

		req.user = user;
		next();
	});
};