var mongodb = require('../lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("productTypes");
}

function createProductTypes(items, callback) {
    var coll = getCollection();
    coll.insert(items, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

function findAllProductTypes(callback) {
    var coll = getCollection();
    coll.find({}).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findProductTypesByCodes(codes, callback) {
    var coll = getCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

exports.getCollection = getCollection;
exports.createProductTypes = createProductTypes;
exports.findAllProductTypes = findAllProductTypes;
exports.findProductTypesByCodes = findProductTypesByCodes;