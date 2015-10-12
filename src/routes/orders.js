var router = require('express').Router();

var orderService = require('../service/orderService');
var orderStatusService = require('../service/orderStatusService');
var error = require('../error');
var HttpError = error.HttpError;
var log = require('../lib/log')(module);
var checkAccess = require('../middleware/checkAccess');
var loadUser = require('../middleware/loadUser');
var ACCESSES = require('../utils/accesses').ACCESSES;
var pagination = require('../utils/pagination');
var ObjectID = require('mongodb').ObjectID;

router.get('/all-orders', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS), function(req, res, next) {
    var page = pagination.createMongodbPage(req);
    orderService.findAllOrders(page, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/user-orders', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var page = pagination.createMongodbPage(req);
    orderService.findAllOrdersByAuthorId(page, req.user._id, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/order-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    orderService.findOneById(orderId, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/user-order-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    orderService.findOneByIdAndAuthorId(orderId, req.user._id, function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.get('/all-order-statuses', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {

    orderStatusService.findAllOrderStatuses(function(err, result) {
            if (err) {
                return next(err);
            }
            res.json(result);
        }
    );
});

router.post('/create-order', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var order = req.body.order;

    if (!product.measureUnit) {
        return next(new HttpError(400, "Поле единица измерения пустое"));
    }

    if (!product.title) {
        return next(new HttpError(400, "Поле наименование пустое"));
    }

    product.measureUnit_id = new ObjectID(product.measureUnit._id);
    delete product.measureUnit;

    if (product.type) {
        product.type_id = new ObjectID(product.type._id);
        delete product.type;
    }

    product.createdDate = new Date();

    productService.createProduct(product, function(err, newProduct) {
        if (err)
            return next(err);

        res.send({});
    });
});

module.exports = router;
