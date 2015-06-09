var mongodb = require('lib/mongodb');
var changelog = require('lib/changelog');
asyncUtils = require('utils/asyncUtils');
var userService = require('service/userService');
var roleService = require('service/roleService');

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
        }
		process.exit(err ? 255 : 0);
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
                    roleService.assignUserRoles(newUser, [newRole], changeCallback);
                });
            });
        }
    });
    changelog.executeAllChangesets(changesets, callback);
}


