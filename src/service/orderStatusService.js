var mongodb = require('../lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("orderStatuses");
}

function createOrderStatuses(items, callback) {
    var coll = getCollection();
    coll.insert(items, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

function findAllOrderStatuses(callback) {
    var coll = getCollection();
    coll.find({}).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findOrderStatusesByCodes(codes, callback) {
    var coll = getCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

exports.getCollection = getCollection;
exports.createOrderStatuses = createOrderStatuses;
exports.findAllOrderStatuses = findAllOrderStatuses;
exports.findOrderStatusesByCodes = findOrderStatusesByCodes;