var mongodb = require('../lib/mongodb');
var orderStatusService = require('../service/orderStatusService');
var userService = require('../service/userService');

function getCollection() {
	return mongodb.getDb().collection("orders");
}

function createOrder(item, callback) {
    var coll = getCollection();
    coll.insert(item, function(err, results){
        if (err) {
            return callback(err);
        }
        return callback(null, item);
    });
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
                    order.status = statusesMap[order.status_id.toString()]
                }
                order.author = usersMap[order.author_id.toString()];
                // найти точкеу доставки
                for(var j=0; j<order.author.deliveryPoints; ++j) {
                    var dp = order.author.deliveryPoints[j];
                    if (order.author_id.toString()===dp._id.toString()) {
                        order.authorDeliveryPoint = dp;
                    }
                }
            }

            callback(null, orders);
        });


    });
}

function findAllOrdersByFilter(page, filter, callback) {
    var coll = getCollection();
    coll.find(filter, {skip:page.skip, limit:page.limit, sort: {created_date: 1}}).toArray(function(err, orders) {
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
            callback(null, null);
        }

        enrichmentOrders([order], function(err, eOrders) {
            if (err) {
                return callback(err);
            }

            callback(null, eOrders[0]);
        });
    });
}

function findOneByIdAndAuthorId(id, authorId, callback) {
    findOneOrderByFilter({_id: id, author_id: authorId}, callback);
}

function findOneById(id, callback) {
    findOneOrderByFilter({_id: id}, callback);
}

function createOrder(item, callback) {
    var coll = getCollection();
    coll.insert(item, function(err, results){
        if (err) {
            return callback(err);
        }
        return callback(null, item);
    });
}

exports.getCollection = getCollection;
exports.findAllOrders = findAllOrders;
exports.findAllOrdersByAuthorId = findAllOrdersByAuthorId;
exports.findOneByIdAndAuthorId = findOneByIdAndAuthorId;
exports.findOneById = findOneById;
exports.createOrder = createOrder;



