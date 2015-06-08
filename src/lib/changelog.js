/**
 * Mongodb change log like 'Liquibase'
 */
var mongodb = require('lib/mongodb');
var log = require('lib/log')(module);

function getCollection() {
    return mongodb.getDb().collection("changelogs");
}

function execute(changeId, changelogFn, callback) {
    var changelogsCollection = getCollection();
    changelogsCollection.findOne({
        changeId : changeId
    }, function(err, changelog) {
        if (err) {
            return callback(err);
        }

        if (!changelog) {
            log.info("Start execute changelog: " + changeId);
            changelogFn(function(err, result) {
                if (err) {
                    return callback(err);
                }

                // write success execution change log
                changelogsCollection.insert({changeId: changeId, creationDate: new Date()},
                    function(err, newChangelog) {
                        if (err) {
                            return callback(err);
                        }

                        log.info("Success insert changelog: " + changeId);
                        callback(null, newChangelog);
                    }
                );
            });
        }
    });
}

exports.getCollection = getCollection;
exports.execute = execute;