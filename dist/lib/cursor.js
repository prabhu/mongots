var util = require('util');
var thunky = require('thunky');
var Readable = require('readable-stream').Readable;
var Cursor = (function () {
    function Cursor(opts) {
        Readable.call(this, { objectMode: true, highWaterMark: 0 });
        var self = this;
        this._opts = opts;
        var onserver = this._opts.onserver;
        this._get = thunky(function (cb) {
            onserver(function (err, server) {
                if (err)
                    return cb(err);
                cb(null, server.cursor(self._opts.fullCollectionName, {
                    find: self._opts.fullCollectionName,
                    query: self._opts.query || {},
                    fields: self._opts.projection,
                    sort: self._opts.sort,
                    skip: self._opts.skip,
                    limit: self._opts.limit,
                    batchSize: self._opts.batchSize,
                    explain: self._opts.explain,
                    maxTimeMS: self._opts.maxTimeMS
                }));
            });
        });
    }
    return Cursor;
})();
;
util.inherits(Cursor, Readable);
Cursor.prototype.next = function (cb) {
    this._get(function (err, cursor) {
        if (err)
            return cb(err);
        cursor.next(cb);
    });
    return this;
};
Cursor.prototype.rewind = function (cb) {
    this._get(function (err, cursor) {
        if (err)
            return cb(err);
        cursor.rewind(cb);
    });
    return this;
};
Cursor.prototype.toArray = function (cb) {
    var array = [];
    var self = this;
    var loop = function () {
        self.next(function (err, obj) {
            if (err)
                return cb(err);
            if (!obj)
                return cb(null, array);
            array.push(obj);
            loop();
        });
    };
    loop();
};
Cursor.prototype.map = function (mapfn, cb) {
    var array = [];
    var self = this;
    var loop = function () {
        self.next(function (err, obj) {
            if (err)
                return cb(err);
            if (!obj)
                return cb(null, array);
            array.push(mapfn(obj));
            loop();
        });
    };
    loop();
};
Cursor.prototype.forEach = function (fn) {
    var array = [];
    var self = this;
    var loop = function () {
        self.next(function (err, obj) {
            if (err)
                return fn(err);
            fn(err, obj);
            if (!obj)
                return;
            loop();
        });
    };
    loop();
};
Cursor.prototype.limit = function (n, cb) {
    this._opts.limit = n;
    if (cb)
        return this.toArray(cb);
    return this;
};
Cursor.prototype.skip = function (n, cb) {
    this._opts.skip = n;
    if (cb)
        return this.toArray(cb);
    return this;
};
Cursor.prototype.batchSize = function (n, cb) {
    this._opts.batchSize = n;
    if (cb)
        return this.toArray(cb);
    return this;
};
Cursor.prototype.sort = function (sortObj, cb) {
    this._opts.sort = sortObj;
    if (cb)
        return this.toArray(cb);
    return this;
};
Cursor.prototype.count = function (cb) {
    var self = this;
    var onserver = this._opts.onserver;
    var dbname = this._opts.fullCollectionName.split('.')[0];
    var colname = this._opts.fullCollectionName.split('.')[1];
    var cmd = { count: colname, query: self._opts.query };
    if (this._opts.maxTimeMS) {
        cmd.maxTimeMS = this._opts.maxTimeMS;
    }
    onserver(function (err, server) {
        if (err)
            return cb(err);
        server.command(dbname + '.$cmd', cmd, function (err, result) {
            if (err)
                return cb(err);
            cb(null, result.result.n);
        });
    });
};
Cursor.prototype.size = function (cb) {
    var self = this;
    var onserver = this._opts.onserver;
    var dbname = this._opts.fullCollectionName.split('.')[0];
    var colname = this._opts.fullCollectionName.split('.')[1];
    onserver(function (err, server) {
        if (err)
            return cb(err);
        var cmd = { count: colname };
        if (self._opts.query)
            cmd.query = self._opts.query;
        if (self._opts.limit)
            cmd.limit = self._opts.limit;
        if (self._opts.skip)
            cmd.skip = self._opts.skip;
        if (self._opts.maxTimeMS)
            cmd.maxTimeMS = self._opts.maxTimeMS;
        server.command(dbname + '.$cmd', cmd, function (err, result) {
            if (err)
                return cb(err);
            cb(null, result.result.n);
        });
    });
};
Cursor.prototype.explain = function (cb) {
    var q = this._opts.query || {};
    this._opts.query = { $query: q, $explain: 1 };
    this.next(cb);
};
Cursor.prototype.destroy = function () {
    var self = this;
    this._get(function (err, cursor) {
        if (err)
            return self.emit('error', err);
        if (!cursor.close)
            return;
        cursor.close();
    });
};
Cursor.prototype._read = function () {
    var self = this;
    this.next(function (err, data) {
        if (err)
            return self.emit('error', err);
        self.push(data);
    });
};
Cursor.prototype.maxTimeMS = function (maxTimeMS, cb) {
    this._opts.maxTimeMS = maxTimeMS;
    if (cb)
        return this.toArray(cb);
    return this;
};
module.exports = Cursor;
//# sourceMappingURL=cursor.js.map