var mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient,
    Server = mongodb.Server,
    Db = mongodb.Db,
    ObjectId = mongodb.ObjectID;

var config = require('../config');

/**
 * Create url by pattern
 * mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
 * @param mongodbConfig
 */
function createDbUrl() {
    var url = 'mongodb://';
    if (config.mongodb.password && config.mongodb.password.length > 0) {
        url = url + config.mongodb.username + ':' + config.mongodb.password + '@';
    }
    url = url + config.mongodb.host + ':' + config.mongodb.port + '/' + config.mongodb.db;
    return url;
}

var url = createDbUrl(config.mongodb);

var db = null;
function openConnection(callback) {
    MongoClient.connect(url, function(err, _db) {
		if(err) {
			callback(err, null);
		}

        db = _db;
        callback(null, db);
	});
}
function getDb() {
	return db;
}

function closeConnection(callback) {	
	db.close(function(err, result) {
		if(err) {
			callback(err, null);
		}
		callback(null, result);
	});
}

function findById(id, collection, callback) {	
	collection.findOne({"_id": new ObjectId(id)}, callback);
}

exports.openConnection = openConnection;
exports.getDb = getDb;
exports.closeConnection = closeConnection;
exports.findById = findById;
