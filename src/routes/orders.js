var router = require('express').Router();

var orderService = require('../service/orderService');
var orderStatusService = require('../service/orderStatusService');
var userService = require('../service/userService');
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

router.get('/order-by-id', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var orderId = new ObjectID(req.param('orderId'));

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        orderService.findOneById(orderId, function(err, result) {
                if (err) {
                    return next(err);
                }
                res.json(result);
            }
        );
    } else {
        orderService.findOneByIdAndAuthorId(orderId, req.user._id, function(err, result) {
                if (err) {
                    return next(err);
                }
                res.json(result);
            }
        );
    }
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

function editOrder(id, order, req, res, next) {
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
}

function checkCurrentUserIsOrderAuthor(orderId, req, res, next, successCallback) {
    orderService.findOneById(orderId, function(err, dbOrder) {
            if (err) {
                return next(err);
            }
            if (!dbOrder) {
                return next(new HttpError(400, "Заказ не найден ID " + orderId));
            }
            if (dbOrder.author._id.toString() !== req.user._id.toString()) {
                return next(new HttpError(400, "Вы не имеете прав изменять не принадлежащий вам заказ"));
            }

            successCallback();
        }
    );
}

router.post('/edit-order', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var order = req.body.order;
    var id = new ObjectID(order._id);

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        editOrder(id, order, req, res, next);
    } else {
        // TODO: check author
        checkCurrentUserIsOrderAuthor(id, req, res, next, function() {
            editOrder(id, order, req, res, next);
        });
    }
});

router.post('/delete-order', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var id = new ObjectID(req.param('id'));

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        orderService.deleteOrder(id, function(err, result) {
            if (err)
                return next(err);

            res.send(result);
        });
    } else {
        // TODO: check author
        checkCurrentUserIsOrderAuthor(id, req, res, next, function() {
            orderService.deleteOrder(id, function(err, result) {
                if (err)
                    return next(err);

                res.send(result);
            });
        });
    }
});

// ++++++++++++++++++ order product

function addOrderProduct(orderId, orderProduct, req, res, next) {
    if (!orderProduct.product) {
        return next(new HttpError(400, "Поле продукт пустое"));
    }

    orderProduct.product_id = new ObjectID(orderProduct.product._id);
    delete orderProduct.product;

    orderProduct.createdDate = new Date();

    orderService.addOrderProduct(orderId, orderProduct, function(err, results) {
        if (err)
            return next(err);

        res.send(results);
    });
}

function updateOrderProduct(orderId, orderProduct, req, res, next) {
    if (!orderProduct.product) {
        return next(new HttpError(400, "Поле продукт пустое"));
    }

    orderProduct.product_id = new ObjectID(orderProduct.product._id);
    delete orderProduct.product;

    var orderProductId = new ObjectID(orderProduct._id);

    orderService.updateOrderProduct(orderId, orderProductId, orderProduct, function(err, results) {
        if (err)
            return next(err);

        res.send(results);
    });
}

router.post('/add-order-product', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var orderProduct = req.body.orderProduct;
    var orderId = new ObjectID(req.body.orderId);

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        addOrderProduct(orderId, orderProduct, req, res, next);
    } else {
        // TODO: check author
        checkCurrentUserIsOrderAuthor(orderId, req, res, next, function() {
            addOrderProduct(orderId, orderProduct, req, res, next);
        });
    }
});

router.post('/update-order-product', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var orderProduct = req.body.orderProduct;
    var orderId = new ObjectID(req.body.orderId);

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        updateOrderProduct(orderId, orderProduct, req, res, next);
    } else {
        // TODO: check author
        checkCurrentUserIsOrderAuthor(orderId, req, res, next, function() {
            updateOrderProduct(orderId, orderProduct, req, res, next);
        });
    }
});

router.post('/remove-all-order-products', loadUser, checkAccess.getAuditor(ACCESSES.MANAGE_ORDERS | ACCESSES.EDIT_OWN_ORDER), function(req, res, next) {
    var orderId = new ObjectID(req.body.orderId);

    if (userService.isAuthorize(req.user, ACCESSES.MANAGE_ORDERS)) {
        orderService.removeAllOrderProducts(orderId, function(err, results) {
            if (err)
                return next(err);

            res.send(results);
        });
    } else {
        // TODO: check author
        checkCurrentUserIsOrderAuthor(orderId, req, res, next, function() {
            orderService.removeAllOrderProducts(orderId, function(err, results) {
                if (err)
                    return next(err);

                res.send(results);
            });
        });
    }
});

module.exports = router;
