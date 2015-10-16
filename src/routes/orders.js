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

    if (!order.number) {
        return next(new HttpError(400, "Поле номер пустое"));
    }

    if (!order.authorDeliveryPoint) {
        return next(new HttpError(400, "Поле точка доставки пустое"));
    }
    order.authorDeliveryPoint_id = new ObjectID(order.authorDeliveryPoint._id);
    delete order.authorDeliveryPoint;

    order.createdDate = new Date();
    order.author_id = req.user._id;

    orderService.createOrder(order, function(err, newOrder) {
        if (err)
            return next(err);

        res.send(order);
    });
});

router.post('/edit-order', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var order = req.body.order;

    var id = new ObjectID(order._id);
    delete order._id;
    delete order.createdDate;
    delete order.author;
    if (order.author) {
        delete order.author;
    }

    if (!order.number) {
        return next(new HttpError(400, "Поле номер пустое"));
    }

    if (!order.authorDeliveryPoint) {
        return next(new HttpError(400, "Поле точка доставки пустое"));
    }
    order.authorDeliveryPoint_id = new ObjectID(order.authorDeliveryPoint._id);
    delete order.authorDeliveryPoint;

    orderService.editOrder(id, order, function(err, _order) {
        if (err)
            return next(err);

        res.send(_order);
    });
});

module.exports = router;
