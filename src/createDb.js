var mongodb = require('lib/mongodb');
var changelog = require('lib/changelog');
var async = require('async');
asyncUtils = require('utils/asyncUtils');
var userService = require('service/userService');

async.series([ open, createUserConstraints, close ],
		function(err) {
			console.log(arguments);
			process.exit(err ? 255 : 0);
		});

function open(callback) {
	mongodb.openConnection(callback);
}

function dropDatabase(callback) {
	var db = mongodb.getDb();
	db.dropDatabase(callback);
}

function createUserConstraints(callback) {
    userService.createConstraints(callback);
}

function createUsers(callback) {
	var users = [ {
		username : 'Вася',
		password : 'supervasya'
	}, {
		username : 'Петя',
		password : '123'
	}, {
		username : 'admin',
		password : 'thetruehero'
	} ];


    asyncUtils.eachSeries(users,
        // iterator function
        function(userData, eachResultCallback) {
            userService.createUser(userData.username, userData.password, eachResultCallback);
        },
        // iterator result callback arguments from eachResultCallback
        function(createdUser) {
            console.log("createdUser: ", createdUser);
        },
        // finish iterator result
        function(err) {
            if (err) {
                return callback(err);
            }

            return callback(null);
        }
    );
}

function close(callback) {
	console.log("Close connection");
	mongodb.closeConnection(callback);
}
