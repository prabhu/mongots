declare function require(name: string);
var thunky = require('thunky');
var toMongodbCore = require('to-mongodb-core');
var parse = require('parse-mongo-url');

import Database = require('./lib/database');
var getTopology = require('./lib/get-topology');

var getDbName = function (connString: any): string {
  if (typeof connString !== 'string') {
    return null;
  }
  var config = parse(connString);
  return config.dbName;
};

var init = function(connString: any, cols: Array<string>): Database {
  var dbname = getDbName(connString);
  var onserver = thunky(function (cb: any) {
    getTopology(connString, function (err: any, topology: any) {
      if (err) {
        return cb(err);
      }
      cb(null, topology);
    });
  });

  if (!dbname) {
    dbname = connString._dbname;
    onserver = thunky(function (cb: any) {
      toMongodbCore(connString, function (err: any, server: any) {
        if (err) {
          cb(new Error('You must pass a connection string or a mongojs instance.'));
        } else {
          cb(null, server);
        }
      });
    });
  }

  var that = new Database({ name: dbname, cols: cols }, onserver);
  return that;
};

export = init;