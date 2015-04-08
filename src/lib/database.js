var Collection = require('./collection');
var mongoCore = require('mongodb-core');
var bson = mongoCore.BSON;
var xtend = require('xtend');
var noop = function () {
    // ignore
};
var Database = (function () {
    function Database(name, cols, onserver) {
        this._getServer = onserver;
        this._dbname = name;
        var self = this;
        this.ObjectId = bson.ObjectId;
        cols.forEach(function (colName) {
            self[colName] = self.collection(colName);
            var parts = colName.split('.');
            var last = parts.pop();
            var parent = parts.reduce(function (parent, prefix) {
                return parent[prefix] = parent[prefix] || {};
            }, self);
            parent[last] = self.collection(colName);
        });
    }
    Database.prototype.collection = function (colName) {
        return new Collection(colName, this._dbname, this._getServer);
    };
    Database.prototype.close = function (cb) {
        cb = cb || noop;
        this._getServer(function (err, server) {
            if (err) {
                return cb(err);
            }
            server.destroy();
            cb();
        });
    };
    Database.prototype.runCommand = function (opts, cb) {
        cb = cb || noop;
        if (typeof opts === 'string') {
            var tmp = opts;
            opts = {};
            opts[tmp] = 1;
        }
        var self = this;
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            server.command(self._dbname + '.$cmd', opts, function (err, result) {
                if (err)
                    return cb(err);
                cb(null, result.result);
            });
        });
    };
    Database.prototype.getCollectionNames = function (cb) {
        this.collection('system.namespaces').find({ name: /^((?!\$).)*$/ }, function (err, cols) {
            if (err)
                return cb(err);
            cb(null, cols.map(function (col) {
                return col.name.split('.').splice(1).join('.');
            }));
        });
    };
    Database.prototype.createCollection = function (name, opts, cb) {
        if (typeof opts === 'function')
            return this.createCollection(name, {}, opts);
        var cmd = { create: name };
        Object.keys(opts).forEach(function (opt) {
            cmd[opt] = opts[opt];
        });
        this.runCommand(cmd, cb);
    };
    Database.prototype.stats = function (scale, cb) {
        if (typeof scale === 'function')
            return this.stats(1, scale);
        this.runCommand({ dbStats: 1, scale: scale }, cb);
    };
    Database.prototype.dropDatabase = function (cb) {
        this.runCommand('dropDatabase', cb);
    };
    Database.prototype.createUser = function (usr, cb) {
        var cmd = xtend({ createUser: usr.user }, usr);
        delete cmd.user;
        this.runCommand(cmd, cb);
    };
    Database.prototype.addUser = function (usr, cb) {
        this.createUser(usr, cb);
    };
    Database.prototype.dropUser = function (username, cb) {
        this.runCommand({ dropUser: username }, cb);
    };
    Database.prototype.removeUser = function (username, cb) {
        this.dropUser(username, cb);
    };
    Database.prototype.eval = function (fn) {
        var cb = arguments[arguments.length - 1];
        this.runCommand({
            eval: fn.toString(),
            args: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
        }, function (err, res) {
            if (err)
                return cb(err);
            cb(null, res.retval);
        });
    };
    Database.prototype.getLastErrorObj = function (cb) {
        this.runCommand('getLastError', cb);
    };
    Database.prototype.getLastError = function (cb) {
        this.runCommand('getLastError', function (err, res) {
            if (err)
                return cb(err);
            cb(null, res.err);
        });
    };
    Database.prototype.toString = function () {
        return this._dbname;
    };
    return Database;
})();
;
module.exports = Database;
//# sourceMappingURL=database.js.map