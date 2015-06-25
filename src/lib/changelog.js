/**
 * Mongodb change log like 'Liquibase'
 */
var mongodb = require('../lib/mongodb');
var log = require('../lib/log')(module);
var asyncUtils = require('../utils/asyncUtils');

function getCollection() {
    return mongodb.getDb().collection("changelogs");
}

function executeOneChangeset(changeId, changeFn, callback) {
    var changelogCollection = getCollection();
    changelogCollection.findOne({
        changeId : changeId
    }, function(err, changelog) {
        if (err) {
            return callback(err);
        }

        if (changelog) {
            // skip already executed
            log.debug("Skip already executed changelog: " + changeId);
            return callback(null, changelog);
        }

        log.info("Start execute changelog: " + changeId);
        changeFn(function(err, result) {
            if (err) {
                return callback(err);
            }

            // write success execution change log
            var newLog = {changeId: changeId, creationDate: new Date()};
            changelogCollection.insert(newLog,
                function(err, newChangelog) {
                    if (err) {
                        return callback(err);
                    }

                    log.info("Success insert changelog: " + changeId);
                    callback(null, newLog, true);
                }
            );
        });
    });
}

/**
 *
 * @param changesets array of Changeset {changeId: 'someId', changeFn: function() {//... some actions}}
 * @param callback
 */
function executeAllChangesets(changesets, callback) {
    var counter = 0;
    asyncUtils.eachSeries(changesets,
        // iterator function
        function(changeset, eachResultCallback) {
            executeOneChangeset(changeset.changeId, changeset.changeFn, eachResultCallback);
        },
        // iterator result callback arguments from eachResultCallback
        function(changelog, isInsertNew) {
            if (isInsertNew) {
                counter++;
            }
        },
        // finish iterator result
        function(err) {
            if (err) {
                return callback(err);
            }

            log.info("Insert " + counter + " rows");
            return callback(null);
        }
    );
}

exports.getCollection = getCollection;
exports.executeAllChangesets = executeAllChangesets;