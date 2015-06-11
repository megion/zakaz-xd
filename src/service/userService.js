var User = require('models/user').User;
var Role = require('models/role').Role;
var mongodb = require('lib/mongodb');
var crypto = require('crypto');
var AuthError = require('error').AuthError;
var roleService = require('service/roleService');

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
    if (!username) {
        return callback(new AuthError("Имя пользователя неопределено"));
    }

    if (!password) {
        return callback(new AuthError("Пароль неопределен"));
    }

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
            }
        }
    );
}

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

function findWithRolesById(id, callback) {
    var usersCollection = getCollection();
    usersCollection.findOne({
        _id : id
    }, function(err, user) {
        if (err) {
            return callback(err);
        }

        if (!user) {
            return callback(null, user);
        }

        roleService.findUserRoles(user, function(err, roles) {
            if (err) {
                return callback(err);
            }
            user.roles = roles;
            return callback(null, user);
        });
    });
}

function isAuthorize(user, access) {
    for (var i=0; i<user.roles.length; i++) {
        var role = user.roles[i];
        for (var j=0; j<role.accesses.length; j++) {
            var userAccess = role.accesses[j].value;
            if (access & userAccess) {
                return true;
            }
        }
    }

    return false;
}

exports.setPassword = setPassword;
exports.authorize = authorize;
exports.createUser = createUser;
exports.getCollection = getCollection;
exports.findById = findById;
exports.findWithRolesById = findWithRolesById;
exports.isAuthorize = isAuthorize;
