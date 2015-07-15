var mongodb = require('../lib/mongodb');
var measureUnitService = require('../service/measureUnitService');
var productTypeService = require('../service/productTypeService');

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

        productTypeService.findAllProductTypes(function(err, allProductTypes) {
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
            var typesMap = {};
            if (allProductTypes) {
                for (i=0; i<allProductTypes.length; i++) {
                    var type = allProductTypes[i];
                    typesMap[type._id.toString()] = type;
                }
            }


            // обогощение
            for (i=0; i<products.length; i++) {
                var item = products[i];
                if (item.measureUnit_id) {
                    item.measureUnit = unitsMap[item.measureUnit_id.toString()];
                }

                if (item.type_id) {
                    item.type = typesMap[item.type_id.toString()];
                }
            }

            callback(null, products);
        });

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

function editProduct(id, item, callback) {
    var coll = getCollection();

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

function deleteProduct(id, callback) {
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

exports.getCollection = getCollection;
exports.findAllProducts = findAllProducts;
exports.findOneById = findOneById;
exports.createProduct = createProduct;
exports.editProduct = editProduct;
exports.deleteProduct = deleteProduct;



