declare function require(name: string);

import Collection = require('./collection');
var mongoCore = require('mongodb-core');
var bson = mongoCore.BSON;
var xtend = require('xtend');

var noop = function () {
  // ignore
};

class Database {
  private _getServer;
  private _dbname: string;
  private ObjectId;

  constructor(name: string, cols: Array<string>, onserver: any) {
    this._getServer = onserver;
    this._dbname = name;

    var self = this;
    this.ObjectId = bson.ObjectId;
    cols.forEach(function (colName: string) {
      self[colName] = self.collection(colName);
      var parts = colName.split('.');

      var last = parts.pop();
      var parent = parts.reduce(function (parent: any, prefix: string) {
        return parent[prefix] = parent[prefix] || {};
      }, self);

      parent[last] = self.collection(colName);
    });
  }

  collection(colName: string): Collection {
    return new Collection(colName, this._dbname, this._getServer);
  }

  close (cb: any) {
    cb = cb || noop;
    this._getServer(function (err: any, server: any) {
      if (err) {
        return cb(err);
      }
      server.destroy();
      cb();
    });
  }

  runCommand(opts: any, cb?) {
    cb = cb || noop;
    if (typeof opts === 'string') {
      var tmp = opts;
      opts = {};
      opts[tmp] = 1;
    }

    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.command(self._dbname + '.$cmd', opts, function (err, result) {
        if (err) return cb(err);
        cb(null, result.result);
      });
    });
  }

  getCollectionNames(cb) {
    this.collection('system.namespaces').find({ name: /^((?!\$).)*$/ }, function (err, cols) {
      if (err) return cb(err);
      cb(null, cols.map(function (col) {
        return col.name.split('.').splice(1).join('.');
      }));
    });
  }

  createCollection(name: string, opts, cb) {
    if (typeof opts === 'function') return this.createCollection(name, {}, opts);

    var cmd = { create: name };
    Object.keys(opts).forEach(function (opt) {
      cmd[opt] = opts[opt];
    });
    this.runCommand(cmd, cb);
  }

  stats(scale, cb) {
    if (typeof scale === 'function') return this.stats(1, scale);
    this.runCommand({ dbStats: 1, scale: scale }, cb);
  }

  dropDatabase(cb) {
    this.runCommand('dropDatabase', cb);
  }

  createUser(usr, cb) {
    var cmd = xtend({ createUser: usr.user }, usr);
    delete cmd.user;
    this.runCommand(cmd, cb);
  }

  addUser(usr, cb) {
    this.createUser(usr, cb);
  }

  dropUser(username: string, cb) {
    this.runCommand({ dropUser: username }, cb);
  }

  removeUser(username: string, cb) {
    this.dropUser(username, cb);
  }

  eval(fn) {
    var cb = arguments[arguments.length - 1];
    this.runCommand({
      eval: fn.toString(),
      args: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
    }, function (err, res) {
        if (err) return cb(err);
        cb(null, res.retval);
      })
  }

  getLastErrorObj(cb) {
    this.runCommand('getLastError', cb);
  }

  getLastError(cb) {
    this.runCommand('getLastError', function (err, res) {
      if (err) return cb(err);
      cb(null, res.err);
    });
  }

  toString(): string {
    return this._dbname;
  }
};

export = Database;
