var router = require('express').Router();

var orderService = require('../service/orderService');
var roleService = require('../service/roleService');
var error = require('../error');
var HttpError = error.HttpError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;
var pagination = require('../utils/pagination');
var ObjectID = require('mongodb').ObjectID;

router.get('/all-orders', loadUser, checkAccess.getAuditor(ACCESSES.VIEW_ALL_ORDER), function(req, res, next) {
    var page = pagination.createMongodbPage(req);
    orderService.findAllOrders(page, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/user-orders', loadUser, checkAccess.getAuditor(ACCESSES.VIEW_ALL_ORDER | ACCESSES.VIEW_OWN_ORDERS), function(req, res, next) {
    var page = pagination.createMongodbPage(req);
    orderService.findAllOrdersByAuthorId(page, req.user._id,function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/order-by-id', loadUser, checkAccess.getAuditor(ACCESSES.VIEW_ALL_ORDER), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    orderService.findOneById(orderId, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/user-order-by-id', loadUser, checkAccess.getAuditor(ACCESSES.VIEW_OWN_ORDERS), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    orderService.findOneByIdAndAuthorId(orderId, req.user._id, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

module.exports = router;