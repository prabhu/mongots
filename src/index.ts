/// <reference path='../Scripts/typings/node/node.d.ts' />
declare var Proxy;
var thunky = require('thunky');
var toMongodbCore = require('to-mongodb-core');
var parse = require('parse-mongo-url');

import Database = require('./lib/database');
var getTopology = require('./lib/get-topology');

var getdbName = function (connString: string): string {  
  var config = parse(connString);
  return config.dbName;
};

var init = function (connString: any, cols: Array<string>): Database {
  var dbName = null;
  if (typeof connString === 'string') {
    dbName = getdbName(connString);

    var onserver = thunky(function (cb: any) {
      getTopology(connString, function (err: any, topology: any) {
        if (err) {
          return cb(err);
        }
        cb(null, topology);
      });
    });
  } else {
    dbName = connString.dbName;
    onserver = thunky(function (cb: any) {
      toMongodbCore(connString, function (err: any, server: any) {
        if (err) {
          cb(new Error('You must pass a connection string or a mongots instance.'));
        } else {
          cb(null, server);
        }
      });
    });
  }

  var that = new Database(dbName, cols || [], onserver);
  if (typeof Proxy !== 'undefined') {
    var p = Proxy.create({
      get: function (obj, prop) {
        if (that[prop]) return that[prop];
        that[prop] = that.collection(prop);
        return that[prop];
      }
    });

    return p;
  };
  return that;
};

export = init;