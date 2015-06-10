var User = require('models/user').User;
var Role = require('models/role').Role;
var Access = require('models/access').Access;
var UserRole = require('models/userRole').UserRole;
var RoleAccess = require('models/roleAccess').RoleAccess;
var mongodb = require('lib/mongodb');

function getCollection() {
	return mongodb.getDb().collection("roles");
}

function getAccessesCollection() {
    return mongodb.getDb().collection("accesses");
}

/**
 * Collection for ManyToMany user <-> role
 */
function getUserRolesCollection() {
    return mongodb.getDb().collection("userRoles");
}
/**
 * Collection for ManyToMany role <-> access
 */
function getRoleAccessesCollection() {
    return mongodb.getDb().collection("roleAccesses");
}


function createRole(code, title, callback) {
	var role = new Role(code, title);
	var roleCollection = getCollection();
	roleCollection.insert(role, function(err, result){
		if (err) {
			return callback(err);
		}
		callback(null, role);
	});
}

function createAccesses(accesses, callback) {
    var coll = getAccessesCollection();
    coll.insert(accesses, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
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

function assignRoleAccesses(role, accesses, callback) {
    var roleAccessesCollection = getRoleAccessesCollection();
    // remove all role access
    roleAccessesCollection.remove({role_id: role._id}, function(err, numberRemoved) {
        if (err) {
            return callback(err);
        }

        // insert new user roles
        var roleAccesses = [];
        for (var i = 0; i < accesses.length; i++) {
            var access = accesses[i];
            roleAccesses.push(new RoleAccess(role._id, access._id));
        }

        roleAccessesCollection.insert(roleAccesses, {w: 1}, function(err, results){
            if (err) {
                return callback(err);
            }
            callback(null, results.ops);
        });
    });
}

function findRoleByCode(code, callback) {
    var coll = getCollection();
    coll.findOne({
        code : code
    }, function(err, role) {
        if (err) {
            return callback(err);
        }
        if (!role) {
            callback(new Error("Cannot find role by code: " + code));
        }
        return callback(null, role);
    });
}

exports.getCollection = getCollection;
exports.getAccessesCollection = getAccessesCollection;
exports.createRole = createRole;
exports.createAccesses = createAccesses;
exports.assignUserRoles = assignUserRoles;
exports.assignRoleAccesses = assignRoleAccesses;
exports.findRoleByCode = findRoleByCode;

