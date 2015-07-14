var mongodb = require('../lib/mongodb');
var measureUnitService = require('../service/measureUnitService');

function getCollection() {
	return mongodb.getDb().collection("products");
}

/**
 * Обогощение данных
 */
function enrichmentProducts(products, callback) {
    measureUnitService.findAllMeasureUnits(function(err, allMeasureUnits) {
        if (err) {
            return callback(err);
        }
        var unitsMap = {};
        if (allMeasureUnits) {
            for (var i=0; i<allMeasureUnits.length; i++) {
                var unit = allMeasureUnits[i];
                unitsMap[unit._id.toString()] = unit;
            }
        }
        // обогощение
        for (i=0; i<products.length; i++) {
            var item = products[i];
            if (item.measureUnit_id) {
                item.measureUnit = unitsMap[item.measureUnit_id.toString()];
            }
        }

        callback(null, products);
    });

}

function findAllProductsByFilter(page, filter, callback) {
    var coll = getCollection();
    coll.find(filter, {skip:page.skip, limit:page.limit, sort: {created_date: 1}}).toArray(function(err, items) {
        if (err) {
            return callback(err);
        }

        enrichmentProducts(items, function(err, eItems) {
            if (err) {
                return callback(err);
            }

            coll.count(function(err, count) {
                if (err) {
                    return callback(err);
                }
                return callback(null, {count: count, items: eItems});
            });
        });
    });
}

function findOneProductByFilter(filter, callback) {
    var coll = getCollection();
    coll.findOne(filter, function(err, item) {
        if (err) {
            return callback(err);
        }

        if (!item) {
            return callback(null, null);
        }

        enrichmentProducts([item], function(err, eItems) {
            if (err) {
                return callback(err);
            }

            callback(null, eItems[0]);
        });
    });
}

function findAllProducts(page, callback) {
    findAllProductsByFilter(page, {}, callback);
}

function findOneById(id, callback) {
    findOneProductByFilter({_id: id}, callback);
}

function createProduct(item, callback) {
    var coll = getCollection();
    coll.insert(item, function(err, results){
        if (err) {
            return callback(err);
        }
        return callback(null, item);
    });
}

exports.getCollection = getCollection;
exports.findAllProducts = findAllProducts;
exports.findOneById = findOneById;
exports.createProduct = createProduct;



