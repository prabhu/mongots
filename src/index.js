var thunky = require('thunky');
var toMongodbCore = require('to-mongodb-core');
var parse = require('parse-mongo-url');
var Database = require('./lib/database');
var getTopology = require('./lib/get-topology');
var getDbName = function (connString) {
    var config = parse(connString);
    return config.dbName;
};
var init = function (connString, cols) {
    var dbname = null;
    if (typeof connString === 'string') {
        dbname = getDbName(connString);
        var onserver = thunky(function (cb) {
            getTopology(connString, function (err, topology) {
                if (err) {
                    return cb(err);
                }
                cb(null, topology);
            });
        });
    }
    else {
        dbname = connString._dbname;
        onserver = thunky(function (cb) {
            toMongodbCore(connString, function (err, server) {
                if (err) {
                    cb(new Error('You must pass a connection string or a mongots instance.'));
                }
                else {
                    cb(null, server);
                }
            });
        });
    }
    var that = new Database(dbname, cols || [], onserver);
    return that;
};
module.exports = init;
//# sourceMappingURL=index.js.map