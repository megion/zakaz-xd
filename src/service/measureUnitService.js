var mongodb = require('../lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("measureUnits");
}

function createMeasureUnits(measureUnits, callback) {
    var coll = getCollection();
    coll.insert(measureUnits, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

function findAllMeasureUnits(callback) {
    var coll = getCollection();
    coll.find({}).toArray(function(err, result) {
        if (err) {
            return callback(err);
        }
        return callback(null, result);
    });
}

function findMeasureUnitsByCodes(codes, callback) {
    var coll = getCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

exports.getCollection = getCollection;
exports.createMeasureUnits = createMeasureUnits;
exports.findAllMeasureUnits = findAllMeasureUnits;
exports.findMeasureUnitsByCodes = findMeasureUnitsByCodes;