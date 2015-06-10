var mongodb = require('lib/mongodb');
var changelog = require('lib/changelog');
asyncUtils = require('utils/asyncUtils');
var userService = require('service/userService');
var roleService = require('service/roleService');
var Access = require('models/access').Access;
var ACCESSES = require('utils/accesses').ACCESSES;

asyncUtils.eachSeries([ open, dropDatabase, runChangelogs, close ],
    // iterator function
    function(itemFn, eachResultCallback) {
        itemFn(eachResultCallback);
    },
    function() {
    },
    // finish iterator result
    function(err) {
        if (err) {
            console.error("Error: ", err);
        } else {
            console.log("Success finishing createDb script");
        }
		//process.exit(err ? 255 : 0);
    }
);

function open(callback) {
    console.log("Open connection");
	mongodb.openConnection(callback);
}

function dropDatabase(callback) {
	var db = mongodb.getDb();
	db.dropDatabase(callback);
}

function close(callback) {
	console.log("Close connection");
	mongodb.closeConnection(callback);
}

/**
 * Нельзя изменять существующие записи changeset, можно только добавлять новые.
 */
function runChangelogs(callback) {
    console.log("Run execute changelogs");
    var changesets = [];

    // create changelog index
    changesets.push({
        changeId: 1,
        changeFn: function(changeCallback) {
            var indexes = [];
            var changelogCollection = changelog.getCollection();
            changelogCollection.createIndex( { "changeId": 1 }, { unique: true }, changeCallback);
        }
    });
    // create user index
    changesets.push({
        changeId: 2,
        changeFn: function(changeCallback) {
            var userCollection = userService.getCollection();
            userCollection.createIndex( { "username": 1 }, { unique: true }, changeCallback);
        }
    });
    // create role index
    changesets.push({
        changeId: 3,
        changeFn: function(changeCallback) {
            var roleCollection = roleService.getCollection();
            roleCollection.createIndex( { "code": 1 }, { unique: true }, changeCallback);
        }
    });
    // insert admin
    changesets.push({
        changeId: 4,
        changeFn: function(changeCallback) {
            userService.createUser("admin", "admin", function(err, newUser) {
                if (err) {
                    return changeCallback(err);
                }

                roleService.createRole("ADMIN", "Администратор", function(err, newRole) {
                    if (err) {
                        return changeCallback(err);
                    }
                    roleService.assignUserRoles(newUser, [newRole], function(err) {
                        if (err) {
                            return changeCallback(err);
                        }
                        return changeCallback(null);
                    });
                });
            });
        }
    });
    // create access index
    changesets.push({
        changeId: 5,
        changeFn: function(changeCallback) {
            var coll = roleService.getAccessesCollection();
            coll.createIndex( { "code": 1 }, { unique: true }, changeCallback);
        }
    });
    // insert accesses
    changesets.push({
        changeId: 6,
        changeFn: function(changeCallback) {
            var accesses = [
                new Access('MANAGE_USERS', ACCESSES.MANAGE_USERS, 'Управление пользователями'),
                new Access('CREATE_ORDER', ACCESSES.CREATE_ORDER, 'Создание заказа'),
                new Access('VIEW_OWN_ORDERS', ACCESSES.VIEW_OWN_ORDERS, 'Просмотр своих заказов'),
                new Access('EDIT_OWN_ORDER', ACCESSES.EDIT_OWN_ORDER, 'Редактирование своего заказа'),
                new Access('REMOVE_OWN_ORDER', ACCESSES.REMOVE_OWN_ORDER, 'Удаление своего заказа'),
                new Access('VIEW_ALL_ORDER', ACCESSES.VIEW_ALL_ORDER, 'Просмотр всех заказов'),
                new Access('EDIT_ANY_ORDER', ACCESSES.EDIT_ANY_ORDER, 'Редактирование любого заказа'),
                new Access('REMOVE_ANY_ORDER', ACCESSES.REMOVE_ANY_ORDER, 'Удаление любого заказа'),
                new Access('CHANGE_OWN_PASSWORD', ACCESSES.CHANGE_OWN_PASSWORD, 'Изменение своего пароля')
            ];
            roleService.createAccesses(accesses, function(err, insertedAccesses) {
                if (err) {
                    return changeCallback(err);
                }

                // назначить начальные доступы на роль ADMIN (два доступа)
                roleService.findRoleByCode("ADMIN", function(err, adminRole) {
                    if (err) {
                        return changeCallback(err);
                    }
                    roleService.assignRoleAccesses(adminRole, [insertedAccesses[0], insertedAccesses[8]], function(err) {
                        if (err) {
                            return changeCallback(err);
                        }
                        return changeCallback(null);
                    });
                });
            });
        }
    });

    changelog.executeAllChangesets(changesets, callback);
}


