var router = require('express').Router();

var productService = require('../service/productService');
var error = require('../error');
var HttpError = error.HttpError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;
var pagination = require('../utils/pagination');
var ObjectID = require('mongodb').ObjectID;

router.get('/all-products', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var page = pagination.createMongodbPage(req);
    productService.findAllProducts(page, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/product-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_PRODUCTS), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    productService.findOneById(orderId, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

module.exports = router;
