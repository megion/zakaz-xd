var User = require('../models/user').User;
var UserRole = require('../models/userRole').UserRole;
var mongodb = require('../lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("orders");
}

function getStatusesCollection() {
    return mongodb.getDb().collection("orderStatuses");
}

function getTypesCollection() {
    return mongodb.getDb().collection("orderTypes");
}

function createStatuses(orderStatuses, callback) {
    var coll = getStatusesCollection();
    coll.insert(orderStatuses, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

function createTypes(orderTypes, callback) {
    var coll = getTypesCollection();
    coll.insert(orderTypes, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

/**
 * Обогощение данных
 */
function enrichmentOrders(orders, allTypes, allStatuses) {
    var typesMap = {};
    if (allTypes) {
        for (var i=0; i<allTypes.length; i++) {
            var type = allTypes[i];
            typesMap[type._id.toString()] = type;
        }
    }
    var statusesMap = {};
    if (allStatuses) {
        for (i=0; i<allStatuses.length; i++) {
            var status = allStatuses[i];
            statusesMap[status._id.toString()] = status;
        }
    }

    // обогощение
    for (i=0; i<orders.length; i++) {
        var order = orders[i];
        if (order.type_id) {
            order.type = typesMap[order.type_id._id.toString()];
        }
        if (order.status_id) {
            order.status = statusesMap[order.status_id.toString()]
        }
    }
}

function findAllOrders(page, callback) {
    var coll = getCollection();
    coll.find({}, {skip:page.skip, limit:page.limit, sort: {created_date: 1}}).toArray(function(err, orders) {
        if (err) {
            return callback(err);
        }

        findAllStatuses(function(err, allStatuses) {
            if (err) {
                return callback(err);
            }
            findAllTypes(function(err, allTypes) {
                if (err) {
                    return callback(err);
                }

                enrichmentOrders(orders, allStatuses, allTypes)
                coll.count(function(err, count) {
                    return callback(null, {count: count, items: orders});
                });
            });
        });
    });
}

function findAllStatuses(callback) {
    var coll = getStatusesCollection();
    coll.find({}).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findAllTypes(callback) {
    var coll = getTypesCollection();
    coll.find({}).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findStatusesByCodes(codes, callback) {
    var coll = getStatusesCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

function findTypesByCodes(codes, callback) {
    var coll = getTypesCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

exports.getCollection = getCollection;
exports.getStatusesCollection = getStatusesCollection;
exports.getTypesCollection = getTypesCollection;
exports.createStatuses = createStatuses;
exports.createTypes = createTypes;
exports.findAllOrders = findAllOrders;
exports.findAllStatuses = findAllStatuses;
exports.findAllTypes = findAllTypes;
exports.findStatusesByCodes = findStatusesByCodes;
exports.findTypesByCodes = findTypesByCodes;


