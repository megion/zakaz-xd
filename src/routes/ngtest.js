var router = require('express').Router();
var HttpError = require('error').HttpError;
var ObjectID = require('mongodb').ObjectID;
var log = require('lib/log')(module);

router.get('/', function(req, res, next) {
	res.render('ang/test1', {});
});
router.get('/test2', function(req, res, next) {
	res.render('ang/test2', {});
});
router.get('/test3', function(req, res, next) {
	res.render('ang/test3', {});
});


module.exports = router;
