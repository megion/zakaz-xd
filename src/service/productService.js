var mongodb = require('../lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("products");
}

function findAllProductsByFilter(page, filter, callback) {
    var coll = getCollection();
    coll.find(filter, {skip:page.skip, limit:page.limit, sort: {created_date: 1}}).toArray(function(err, items) {
        if (err) {
            return callback(err);
        }

        coll.count(function(err, count) {
            if (err) {
                return callback(err);
            }
            return callback(null, {count: count, items: items});
        });
    });
}

function findOneProductByFilter(filter, callback) {
    var coll = getCollection();
    coll.findOne(filter, function(err, item) {
        if (err) {
            return callback(err);
        }

        return callback(null, item);
    });
}

function findAllProducts(page, callback) {
    findAllProductsByFilter(page, {}, callback);
}

function findOneById(id, callback) {
    findOneProductByFilter({_id: id}, callback);
}

function createProduct(item, password, callback) {
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



