var User = require('models/user').User;
var mongodb = require('lib/mongodb');
var crypto = require('crypto');
var AuthError = require('error').AuthError;

function encryptPassword(user, password) {
	return crypto.createHmac('sha1', user.salt).update(password).digest('hex');
}

function setPassword(user, password) {
	user.salt = Math.random() + '';
	user.hashedPassword = encryptPassword(user, password);
}

function checkPassword(user, password) {
	return encryptPassword(user, password) === user.hashedPassword;
}

function getCollection() {
	return mongodb.getDb().collection("users");
}

function createUser(username, password, callback) {
	var user = new User(username);
	setPassword(user, password);
	var usersCollection = getCollection();
	usersCollection.insert(user, function(err, results){
		if (err) {
			return callback(err);
		}
	
		user._plainPassword = password;
		callback(null, user);
	});
}

/**
 * Если пользователь найден по имени тогда проверка пароля,
 * если не найден тогда ошибка
 */
function authorize(username, password, callback) {
	var usersCollection = getCollection();
    usersCollection.findOne({username : username},
        function(err, user){
            if (err) {
                return callback(err);
            }
            if (user) {
                if (checkPassword(user, password)) {
                    callback(null, user);
                } else {
                    callback(new AuthError("Пароль неверен"));
                }
            } else {
                callback(new AuthError("Пользователь '" + username + "' не найден"));
                //createUser(username, password, callback);
            }
        }
    );
}

/**
 * Если пользователь найден по имени тогда проверка пароля,
 * если не найден тогда ошибка
 */
function findById(id, callback) {
    var usersCollection = getCollection();
    usersCollection.findOne({
        _id : id
    }, function(err, user) {
        if (err) {
            return callback(err);
        }
        return callback(null, user);
    });
}

exports.setPassword = setPassword;
exports.authorize = authorize;
exports.createUser = createUser;
exports.getCollection = getCollection;
exports.findById = findById;
