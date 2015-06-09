var User = require('models/user').User;
var Role = require('models/role').Role;
var UserRole = require('models/userRole').UserRole;
var mongodb = require('lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("roles");
}

/**
 * Collection for ManyToMany user <-> role
 */
function getUserRolesCollection() {
    return mongodb.getDb().collection("userRoles");
}

function createRole(code, title, callback) {
	var role = new Role(code, title);
	var roleCollection = getCollection();
	roleCollection.insert(role, function(err, result){
		if (err) {
			return callback(err);
		}
		callback(null, result);
	});
}

function assignUserRoles(user, roles, callback) {
    var userRolesCollection = getUserRolesCollection();
    // remove all user roles
    userRolesCollection.remove({user_id: user._id}, function(err, numberRemoved) {
        if (err) {
            return callback(err);
        }

        // insert new user roles
        var userRoles = [];
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            userRoles.push(new UserRole(user._id, role._id));
        }

        userRolesCollection.insert(userRoles, {w: 1}, function(err, results){
            if (err) {
                return callback(err);
            }
            callback(null, results.ops);
        });

    });


}

exports.createRole = createRole;
exports.getCollection = getCollection;
exports.assignUserRoles = assignUserRoles;
exports.createRole = createRole;
