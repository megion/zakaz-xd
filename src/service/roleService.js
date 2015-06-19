var User = require('../models/user').User;
var Role = require('../models/role').Role;
var Access = require('../models/access').Access;
var UserRole = require('../models/userRole').UserRole;
var RoleAccess = require('../models/roleAccess').RoleAccess;
var mongodb = require('../lib/mongodb');

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

function createRoles(roles, callback) {
    var roleCollection = getCollection();
    roleCollection.insert(roles, {w: 1}, function(err, results){
        if (err) {
            return callback(err);
        }
        callback(null, results.ops);
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

function mapAccessesToRole(roles, roleAccesses, accesses) {
    var accessIdSetByRoleId = {};
    for (var i=0; i<roleAccesses.length; i++) {
        var roleAccess = roleAccesses[i];
        var item = accessIdSetByRoleId[roleAccess.role_id.toString()];
        if (!item) {
            item = {};
            accessIdSetByRoleId[roleAccess.role_id.toString()] = item;
        }
        item[roleAccess.access_id.toString()] = true;
    }

    var accessById = {};
    for (i=0; i<accesses.length; i++) {
        var access = accesses[i];
        accessById[access._id.toString()] = access;
    }

    // map access for each role
    for (i=0; i<roles.length; i++) {
        var role = roles[i];
        role.accesses = []; // init access array
        var accessIdSet = accessIdSetByRoleId[role._id.toString()];
        for(var accessId in accessIdSet) {
            role.accesses.push(accessById[accessId]);
        }
    }
}

function findAllRolesWithAccesses(callback) {
    var rolesCollection = getCollection();
    // all roles
    rolesCollection.find({}).toArray(function(err, roles) {
        if (err) {
            return callback(err);
        }

        if (!roles || roles.length===0) {
            return callback(null, roles);
        }

        // all roleAccesses
        var roleAccessesCollection = getRoleAccessesCollection();
        roleAccessesCollection.find({}).toArray(function(err, roleAccesses) {
            if (err) {
                return callback(err);
            }

            // значит не назначено ни одного доступа
            if (!roleAccesses || roleAccesses.length===0) {
                return callback(null, roles);
            }

            var accessesCollection = getAccessesCollection();
            accessesCollection.find({}).toArray(function(err, accesses) {
                if (err) {
                    return callback(err);
                }

                // значит не назначено ни одного доступа
                if (!accesses || accesses.length===0) {
                    return callback(new Error("Access collection is empty"));
                }

                // map accesses to role
                mapAccessesToRole(roles, roleAccesses, accesses);
                callback(null, roles);
            });

        });
    });
}

function findUserRoles(user, callback) {
    var userRolesCollection = getUserRolesCollection();

    userRolesCollection.find({user_id : user._id}).toArray(function(err, userRoles) {
        if (err) {
            return callback(err);
        }

        // user has no roles
        if (!userRoles || userRoles.length===0) {
            return callback(null, []);
        }

        findAllRolesWithAccesses(function(err, allRoles) {
            if (err) {
                return callback(err);
            }

            var allRolesById = {};
            for (var i=0; i<allRoles.length; i++) {
                var role = allRoles[i];
                allRolesById[role._id.toString()] = role;
            }

            var rolesForUser = [];
            for (i=0; i<userRoles.length; i++) {
                var userRole = userRoles[i];
                rolesForUser.push(allRolesById[userRole.role_id.toString()]);
            }

            // need sort roles ...

            callback(null, rolesForUser);
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

function findRolesByCodes(codes, callback) {
    var coll = getCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, roles) {
        if (err) {
            return callback(err);
        }
        return callback(null, roles);
    });
}

function findAccessesByCodes(codes, callback) {
    var coll = getAccessesCollection();
    coll.find({code : {$in : codes}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}
function findAccessesByValues(values, callback) {
    var coll = getAccessesCollection();
    coll.find({value : {$in : values}}).toArray(function(err, results) {
        if (err) {
            return callback(err);
        }
        return callback(null, results);
    });
}

exports.getCollection = getCollection;
exports.getAccessesCollection = getAccessesCollection;
exports.createRoles = createRoles;
exports.createAccesses = createAccesses;
exports.assignUserRoles = assignUserRoles;
exports.assignRoleAccesses = assignRoleAccesses;
exports.findRoleByCode = findRoleByCode;
exports.findRolesByCodes = findRolesByCodes;
exports.findAccessesByCodes = findAccessesByCodes;
exports.findAccessesByValues = findAccessesByValues;
exports.findUserRoles = findUserRoles;
exports.findAllRolesWithAccesses = findAllRolesWithAccesses;

