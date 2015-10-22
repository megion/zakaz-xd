var mongodb = require('../lib/mongodb');
var orderStatusService = require('../service/orderStatusService');
var userService = require('../service/userService');
var userProductService = require('../service/userProductService');
var ORDER_STATUSES = require('../utils/orderStatuses').ORDER_STATUSES;

function getCollection() {
	return mongodb.getDb().collection("orders");
}

function createOrder(item, callback) {
    orderStatusService.findOneByCode(ORDER_STATUSES.CREATED, function(err, status) {
        if (err) {
            return callback(err);
        }

        item.status_id = status._id;

        var coll = getCollection();
        coll.insert(item, function(err, results){
            if (err) {
                return callback(err);
            }
            return callback(null, item);
        });

    });
}

function deleteOrder(id, callback) {
    var coll = getCollection();

    coll.deleteOne(
        {_id : id},
        function(err, res) {
            if (err) {
                return callback(err);
            }

            return callback(null, res);
        }
    );
}

function editOrder(id, item, callback) {
    var coll = getCollection();

    // статус не должен менятся при изменении. Статусы меняются отдельными операцями.
    if (item.status_id) {
        delete item.status_id;
    }
    if (item.status) {
        delete item.status;
    }

    coll.updateOne(
        {_id : id},
        {$set: item},
        {upsert:false, w: 1, multi: false},
        function(err, upResult) {
            if (err) {
                return callback(err);
            }

            return callback(null, item);
        }
    );
}

/**
 * Обогощение данных
 */
function enrichmentOrders(orders, callback) {
    orderStatusService.findAllOrderStatuses(function(err, allStatuses) {
        if (err) {
            return callback(err);
        }

        userService.findAllUsers(null, function(err, allUsers) {
            if (err) {
                return callback(err);
            }

            var statusesMap = {};
            if (allStatuses) {
                for (var i=0; i<allStatuses.length; i++) {
                    var status = allStatuses[i];
                    statusesMap[status._id.toString()] = status;
                }
            }

            var usersMap = {};
            if (allUsers) {
                for (var i=0; i<allUsers.length; i++) {
                    var user = allUsers[i];
                    usersMap[user._id.toString()] = user;
                }
            }

            // обогощение
            for (var i=0; i<orders.length; i++) {
                var order = orders[i];
                if (order.status_id) {
                    order.status = statusesMap[order.status_id.toString()];
                    delete order.status_id;
                }
                order.author = usersMap[order.author_id.toString()];
                delete order.author_id;
            }

            callback(null, orders);
        });


    });
}

function enrichmentOneOrder(order, callback) {
    orderStatusService.findAllOrderStatuses(function(err, allStatuses) {
        if (err) {
            return callback(err);
        }

        userService.findById(order.author_id, function(err, author) {
            if (err) {
                return callback(err);
            }
            if (!author) {
                return callback(new Error("Автор не найден author id " + order.author_id));
            }

            var statusesMap = {};
            if (allStatuses) {
                for (var i=0; i<allStatuses.length; i++) {
                    var status = allStatuses[i];
                    statusesMap[status._id.toString()] = status;
                }
            }

            order.author = author;
            delete order.author_id;

            if (order.status_id) {
                order.status = statusesMap[order.status_id.toString()];
                delete order.status_id;
            }

            // найти точку доставки
            if (order.authorDeliveryPoint_id && order.author.deliveryPoints) {
                for(var j=0; j<order.author.deliveryPoints.length; ++j) {
                    var dp = order.author.deliveryPoints[j];
                    if (order.authorDeliveryPoint_id.toString()===dp._id.toString()) {
                        order.authorDeliveryPoint = dp;
                        delete order.authorDeliveryPoint_id;
                        break;
                    }
                }
            }

            callback(null, order);
        });


    });
}

function findAllOrdersByFilter(page, filter, callback) {
    var coll = getCollection();
    var conf = {
        sort: {createdDate: -1}
    };
    if (page) {
        conf.skip = page.skip;
        conf.limit = page.limit;
    }
    coll.find(filter, conf).toArray(function(err, orders) {
        if (err) {
            return callback(err);
        }

        enrichmentOrders(orders, function(err, eOrders) {
            if (err) {
                return callback(err);
            }

            coll.count(function(err, count) {
                if (err) {
                    return callback(err);
                }
                return callback(null, {count: count, items: eOrders});
            });
        });
    });
}

function findAllOrders(page, callback) {
    findAllOrdersByFilter(page, {}, callback);
}

function findAllOrdersByAuthorId(page, authorId, callback) {
    findAllOrdersByFilter(page, {author_id: authorId}, callback);
}

function findOneOrderByFilter(filter, callback) {
    var coll = getCollection();
    coll.findOne(filter, function(err, order) {
        if (err) {
            return callback(err);
        }

        if (!order) {
            return callback(null, null);
        }

        enrichmentOneOrder(order, function(err, eOrder) {
            if (err) {
                return callback(err);
            }

            return callback(null, eOrder);
        });
    });
}

function findOneByIdAndAuthorId(id, authorId, callback) {
    findOneOrderByFilter({_id: id, author_id: authorId}, callback);
}

function findOneById(id, callback) {
    findOneOrderByFilter({_id: id}, function(err, order) {
        if (err) {
            return callback(err);
        }
        if (!order) {
            return callback(new Error("Заказ не найден " + id));
        }
        return callback(null, order);
    });
}

/// order product

function findOrderByIdAndProductId(orderId, productId, callback) {
    var coll = getCollection();
    coll.find({_id: orderId}, { authorProducts: { $elemMatch: { product_id: productId } } }).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
}

function removeOrderProduct(orderId, productId, callback) {
    var coll = getCollection();

    coll.update(
        {_id : orderId},
        { $pull: { authorProducts: { product_id: productId } } },
        { multi: false },
        function(err, res) {
            if (err) {
                return callback(err);
            }

            return callback(null, res);
        }
    );
}

function removeAllOrderProducts(orderId, callback) {
    var coll = getCollection();

    coll.update(
        {_id : orderId},
        { $pull: { authorProducts: {} } },
        { multi: true },
        function(err, res) {
            if (err) {
                return callback(err);
            }

            return callback(null, res);
        }
    );
}

/**
 quantity	количество заказаное
 delivQuantity	количество отгруженое
 unit	единица измерения (шт, кг)
 price	цена за единицу с НДС
 vat	НДС за единицу
 summVAT	сумма НДС
 summ	стоимость
 * @param orderId
 * @param orderProduct
 * @param callback
 */
function addOrderProduct(orderId, orderProduct, callback) {
    var coll = getCollection();

    // TODO: необходимо проверить принадлежит ли продукт автору заказа
    findOneById(orderId, function(err, order){
        if (err) {
            return callback(err);
        }

        // TODO: проверка на уникальность продукта в коллеции
        if (order.authorProducts) {
            for (var i=0; i<order.authorProducts.length; ++i) {
                var p = order.authorProducts[i];
                if (p.product_id.toString() === orderProduct.product_id.toString) {
                    return callback(new Error("Указанный продукт " + orderProduct.product_id.toString()
                    + " уже содержится в заказе " + orderId));
                }
            }
        }

        userProductService.findOneByProductIdAndUserId(orderProduct.product_id, order.author_id, function(err, userProduct) {
            if (err) {
                return callback(err);
            }

            if (!userProduct) {
                return callback(new Error("Указанный продукт " + orderProduct.product_id.toString()
                + " не принадлежит заказчику товара " + order.author_id));
            }

            coll.update(
                { _id: orderId },
                { $push: { authorProducts: orderProduct } },
                function(err, result) {
                    if (err) {
                        return callback(err);
                    }

                    return callback(null, order);
                }
            );

        });
    });

}

function updateOrderProduct(orderId, productId, orderProduct, callback) {
    var coll = getCollection();

    coll.update(
        { _id: orderId, authorProducts: {$elemMatch: {product_id: productId}} },
        { $set: { "authorProducts.$.cost" : orderProduct.cost, "authorProducts.$.vat" : orderProduct.vat } },
        function(err, result) {
            if (err) {
                return callback(err);
            }

            return callback(null, result);
        }
    );
}

exports.getCollection = getCollection;
exports.findAllOrders = findAllOrders;
exports.findAllOrdersByAuthorId = findAllOrdersByAuthorId;
exports.findOneByIdAndAuthorId = findOneByIdAndAuthorId;
exports.findOneById = findOneById;
exports.createOrder = createOrder;
exports.deleteOrder = deleteOrder;
exports.editOrder = editOrder;

// order product
exports.removeOrderProduct = removeOrderProduct;
exports.removeAllOrderProducts = removeAllOrderProducts;
exports.addOrderProduct = addOrderProduct;
exports.updateOrderProduct = updateOrderProduct;



