var mongodb = require('mongodb-core');
var once = require('once');
var Cursor = require('./cursor');
var AggregationCursor = require('./aggregation-cursor');
var Bulk = require('./bulk');
var writeOpts = { writeConcern: { w: 1 }, ordered: true };
var noop = function () {
};
var oid = mongodb.BSON.ObjectID.createPk;
var Code = mongodb.BSON.Code;
var indexName = function (index) {
    return Object.keys(index).map(function (key) {
        return key + '_' + index[key];
    }).join('_');
};
var Collection = (function () {
    function Collection(name, dbname, getServer) {
        this.name = name;
        this.dbName = dbname;
        this._getServer = getServer;
    }
    Collection.prototype.fullColName = function () {
        return this.dbName + '.' + this.name;
    };
    Collection.prototype.find = function (query, projection, cb) {
        if (typeof query === 'function')
            return this.find({}, null, query);
        if (typeof projection === 'function')
            return this.find(query, null, projection);
        var cursor = new Cursor({
            query: query,
            projection: projection,
            onserver: this._getServer,
            fullCollectionName: this.fullColName()
        });
        if (cb) {
            cursor.toArray(cb);
            return null;
        }
        return cursor;
    };
    Collection.prototype.findOne = function (query, projection, cb) {
        if (typeof query === 'function')
            return this.findOne({}, null, query);
        if (typeof projection === 'function')
            return this.findOne(query, null, projection);
        cb = cb || noop;
        this.find(query, projection).next(function (err, doc) {
            if (err)
                return cb(err);
            cb(null, doc);
        });
    };
    Collection.prototype.findAndModify = function (opts, cb) {
        this.runCommand('findAndModify', opts, function (err, result) {
            if (err)
                return cb(err);
            cb(null, result.value, result.lastErrorObject || { n: 0 });
        });
    };
    Collection.prototype.count = function (query, cb) {
        if (typeof query === 'function')
            return this.count({}, query);
        this.find(query).count(cb);
    };
    Collection.prototype.distinct = function (field, query, cb) {
        this.runCommand('distinct', { key: field, query: query }, function (err, result) {
            if (err)
                return cb(err);
            cb(null, result.values);
        });
    };
    Collection.prototype.insert = function (docOrDocs, cb) {
        cb = cb || noop;
        var self = this;
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            var docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
            for (var i = 0; i < docs.length; i++) {
                if (!docs[i]._id)
                    docs[i]._id = oid();
            }
            server.insert(self.fullColName(), docs, writeOpts, function (err, res) {
                if (err)
                    return cb(err);
                cb(null, docOrDocs);
            });
        });
    };
    Collection.prototype.update = function (query, update, opts, cb) {
        if (!opts && !cb)
            return this.update(query, update, {}, noop);
        if (typeof opts === 'function')
            return this.update(query, update, {}, opts);
        cb = cb || noop;
        var self = this;
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            opts.q = query;
            opts.u = update;
            server.update(self.fullColName(), [opts], writeOpts, function (err, res) {
                if (err)
                    return cb(err);
                cb(null, res.result);
            });
        });
    };
    Collection.prototype.save = function (doc, cb) {
        cb = cb || noop;
        if (doc._id) {
            this.update({ _id: doc._id }, doc, { upsert: true }, function (err, result) {
                if (err)
                    return cb(err);
                cb(null, doc);
            });
        }
        else {
            this.insert(doc, cb);
        }
    };
    Collection.prototype.remove = function (query, justOne, cb) {
        if (typeof query === 'function')
            return this.remove({}, false, query);
        if (typeof justOne === 'function')
            return this.remove(query, false, justOne);
        var self = this;
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            server.remove(self.fullColName(), [{ q: query, limit: justOne ? 1 : 0 }], writeOpts, function (err, res) {
                if (err)
                    return cb(err);
                cb(null, res.result);
            });
        });
    };
    Collection.prototype.drop = function (cb) {
        this.runCommand('drop', cb);
    };
    Collection.prototype.mapReduce = function (map, reduce, opts, cb) {
        this.runCommand('mapReduce', {
            map: map.toString(),
            reduce: reduce.toString(),
            query: opts.query || {},
            out: opts.out
        }, cb);
    };
    Collection.prototype.runCommand = function (cmd, opts, cb) {
        if (typeof opts === 'function')
            return this.runCommand(cmd, null, opts);
        var self = this;
        opts = opts || {};
        var cmdObject = {};
        cmdObject[cmd] = this.name;
        Object.keys(opts).forEach(function (key) {
            cmdObject[key] = opts[key];
        });
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            server.command(self.dbName + '.$cmd', cmdObject, function (err, result) {
                if (err)
                    return cb(err);
                cb(null, result.result);
            });
        });
    };
    Collection.prototype.toString = function () {
        return this.name;
    };
    Collection.prototype.dropIndexes = function (cb) {
        this.runCommand('dropIndexes', { index: '*' }, cb);
    };
    Collection.prototype.dropIndex = function (index, cb) {
        this.runCommand('dropIndexes', { index: index }, cb);
    };
    Collection.prototype.createIndex = function (index, opts, cb) {
        if (typeof opts === 'function')
            return this.createIndex(index, {}, opts);
        if (typeof opts === 'undefined')
            return this.createIndex(index, {}, noop);
        opts.name = indexName(index);
        opts.key = index;
        this.runCommand('createIndexes', { indexes: [opts] }, cb);
    };
    Collection.prototype.ensureIndex = function (index, opts, cb) {
        this.createIndex(index, opts, cb);
    };
    Collection.prototype.getIndexes = function (cb) {
        var cursor = new Cursor({
            query: { ns: this.fullColName() },
            projection: {},
            onserver: this._getServer,
            fullCollectionName: this.dbName + '.system.indexes'
        });
        cursor.toArray(cb);
    };
    Collection.prototype.reIndex = function (cb) {
        this.runCommand('reIndex', cb);
    };
    Collection.prototype.isCapped = function (cb) {
        var cursor = new Cursor({
            query: { name: this.fullColName() },
            projection: {},
            onserver: this._getServer,
            fullCollectionName: this.dbName + '.system.namespaces'
        });
        cursor.toArray(function (err, cols) {
            if (err)
                return cb(err);
            cb(null, (cols[0].options && cols[0].options.capped) || false);
        });
    };
    Collection.prototype.stats = function (cb) {
        this.runCommand('collStats', cb);
    };
    Collection.prototype.group = function (doc, cb) {
        var cmd = {
            group: {
                ns: this.name,
                key: doc.key,
                initial: doc.initial,
                $reduce: new Code(doc.reduce.toString()),
                out: 'inline',
                cond: doc.cond,
                $keyf: null
            }
        };
        if (doc.finalize)
            cmd.group['finalize'] = new Code(doc.finalize.toString());
        if (doc.keys) {
            cmd.group.$keyf = new Code(doc.keys.toString());
            delete cmd.group.key;
        }
        else {
            delete cmd.group.$keyf;
        }
        var self = this;
        this._getServer(function (err, server) {
            if (err)
                return cb(err);
            server.command(self.dbName + '.$cmd', cmd, function (err, result) {
                if (err)
                    return cb(err);
                cb(null, result.result.retval);
            });
        });
    };
    Collection.prototype.aggregate = function () {
        var cb;
        var pipeline = Array.prototype.slice.call(arguments);
        if (typeof pipeline[pipeline.length - 1] === 'function') {
            cb = once(pipeline.pop());
        }
        if (cb) {
            this.runCommand('aggregate', { pipeline: pipeline }, function (err, res) {
                if (err)
                    return cb(err);
                cb(null, res.result);
            });
            return;
        }
        var strm = new AggregationCursor({
            onserver: this._getServer,
            colName: this.name,
            fullCollectionName: this.fullColName(),
            pipeline: pipeline
        });
        return strm;
    };
    Collection.prototype.initializeOrderedBulkOp = function () {
        return new Bulk(this.name, true, this._getServer, this.dbName);
    };
    Collection.prototype.initializeUnorderedBulkOp = function () {
        return new Bulk(this.name, false, this._getServer, this.dbName);
    };
    return Collection;
})();
module.exports = Collection;
//# sourceMappingURL=collection.js.map