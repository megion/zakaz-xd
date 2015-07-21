var mongodb = require('../lib/mongodb');
var userService = require('../service/userService');
var ObjectID = require('mongodb').ObjectID;

function getCollection() {
	return mongodb.getDb().collection("userProducts");
}

function createUserProducts(items, callback) {
    var coll = getCollection();
    coll.insert(items, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
    });
}

function editUserProduct(id, item, callback) {
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

/**
 * Обогощение данных
 */
function enrichmentUserProducts(items, callback) {

    var userIds = [];
    for (var i=0; i<items.length; i++) {
        userIds.push(items.user_id);
    }

    userService.findUsersByIds(userIds, function(err, users) {
        if (err) {
            return callback(err);
        }

        var usersMap = {};
        if (users) {
            for (i=0; i<users.length; i++) {
                var user = users[i];
                usersMap[user._id.toString()] = user;
            }
        }

        // обогощение
        for (i=0; i<items.length; i++) {
            var item = items[i];
            if (item.user_id) {
                item.user = usersMap[item.user_id.toString()];
            }
        }

        callback(null, items);

    });
}

function findAllUserProductsByFilter(page, filter, callback) {
    var coll = getCollection();
    var conf = {
        sort: {created_date: 1}
    };
    if (page) {
        conf.skip = page.skip;
        conf.limit = page.limit;
    }
    coll.find(filter, conf).toArray(function(err, items) {
        if (err) {
            return callback(err);
        }

        enrichmentUserProducts(items, function(err, eItems) {
            if (err) {
                return callback(err);
            }

            if (page) {
                coll.find(filter).count(function(err, count) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, {count: count, items: eItems});
                });
            } else {
                return callback(null, eItems);
            }
        });
    });
}

function findOneUserProductByFilter(filter, callback) {
    var coll = getCollection();
    coll.findOne(filter, function(err, item) {
        if (err) {
            return callback(err);
        }

        if (!item) {
            return callback(null, null);
        }

        enrichmentUserProducts([item], function(err, eItems) {
            if (err) {
                return callback(err);
            }

            callback(null, eItems[0]);
        });
    });
}

function findUserProductsByProductId(page, productId, callback) {
    findAllUserProductsByFilter(page, {product_id: productId}, callback);
}

function findOneById(id, callback) {
    findOneUserProductByFilter({_id: id}, callback);
}

exports.getCollection = getCollection;
exports.createUserProducts = createUserProducts;
exports.editUserProduct = editUserProduct;
exports.findUserProductsByProductId = findUserProductsByProductId;
exports.findOneById = findOneById;