/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='./interface/ITypes.d.ts' />
/// <reference path='./interface/ICollection.d.ts' />
/// <reference path='./interface/ICursor.d.ts' />
/// <reference path='./interface/IAggregationCursor.d.ts' />
/// <reference path='./interface/IBulk.d.ts' />

var mongodb = require('mongodb-core');
var once = require('once');
import Cursor = require('./cursor');
import AggregationCursor = require('./aggregation-cursor');
import Bulk = require('./bulk');

var DEFAULT_WRITE_OPTS = { writeConcern: { w: 1 }, ordered: true };
var noop = function () {
  // ignore
};
var oid = mongodb.BSON.ObjectID.createPk;
var Code = mongodb.BSON.Code;

var indexName = function (index: number): string {
  return Object.keys(index).map(function (key: string) {
    return key + '_' + index[key];
  }).join('_');
};

class Collection implements ICollection {
  name: string;
  dbName: string;
  _getServer: any;

  constructor(name: string, dbname: string, getServer: any) {
    this.name = name;
    this.dbName = dbname;
    this._getServer = getServer;
  }

  fullColName(): string {
    return this.dbName + '.' + this.name;
  }

  find(query, projection?, cb?: CallbackType): ICursor {
    if (typeof query === 'function') return this.find({}, null, query);
    if (typeof projection === 'function') return this.find(query, null, projection);

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
  }

  findOne(query, projection?, cb?: CallbackType) {
    if (typeof query === 'function') return this.findOne({}, null, query);
    if (typeof projection === 'function') return this.findOne(query, null, projection);
    cb = cb || noop;
    this.find(query, projection).next(function (err, doc) {
      if (err) return cb(err);
      cb(null, doc);
    });
  }

  findAndModify(opts, cb: CallbackType) {
    this.runCommand('findAndModify', opts, function (err, result) {
      if (err) return cb(err);
      cb(null, result.value, result.lastErrorObject || { n: 0 });
    });
  }

  count(query, cb?: CallbackType) {
    if (typeof query === 'function') return this.count({}, query);
    this.find(query).count(cb);
  }

  distinct(field, query, cb: CallbackType) {
    this.runCommand('distinct', { key: field, query: query }, function (err, result) {
      if (err) return cb(err);
      cb(null, result.values);
    });
  }

  insert(docOrDocs, writeOpts?: InsertOptionsType, cb?: CallbackType) {
    cb = cb || noop;
    if (typeof writeOpts === 'function') {
      // This type of re-assignment is required to satisfy typescript
      var iopts: any = writeOpts;
      return this.insert(docOrDocs, {}, iopts);
    }
    writeOpts = writeOpts || DEFAULT_WRITE_OPTS;
    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);

      var docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
      for (var i = 0; i < docs.length; i++) {
        if (!docs[i]._id) docs[i]._id = oid();
      }
      server.insert(self.fullColName(), docs, writeOpts, function (err, res) {
        if (err) return cb(err);
        cb(null, docOrDocs);
      });
    });
  }

  update(query, update, opts?: UpdateOptionsType, cb?: CallbackType) {
    if (!opts && !cb) {
      return this.update(query, update, {}, noop);
    }
    if (typeof opts === 'function') {
      // This type of re-assignment is required to satisfy typescript
      var popts: any = opts;
      return this.update(query, update, {}, popts);
    }
    cb = cb || noop;
    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);

      opts.q = query;
      opts.u = update;
      server.update(self.fullColName(), [opts], opts.writeConcern || DEFAULT_WRITE_OPTS, function (err, res) {
        if (err) return cb(err);
        cb(null, res.result);
      });
    });
  }

  save(doc, writeOpts?: SaveOptionsType, cb?: CallbackType) {
    cb = cb || noop;
    if (typeof writeOpts === 'function') {
      // This type of re-assignment is required to satisfy typescript
      var sopts: any = writeOpts;
      return this.save(doc, {}, sopts);
    }
    if (doc._id) {
      this.update({ _id: doc._id }, doc, { upsert: true }, function (err, result) {
        if (err) return cb(err);
        cb(null, doc);
      });
    } else {
      this.insert(doc, writeOpts, cb);
    }
  }

  remove(query, justOne?: boolean, opts?: RemoveOptionsType, cb?: CallbackType) {
    if (typeof query === 'function') {
      return this.remove({}, false, {}, query);
    }
    if (typeof justOne === 'function') {
      var cbfn: any = justOne;
      return this.remove(query, false, {}, cbfn);
    }
    if (typeof opts === 'function') {
      var cbfn: any = opts;
      return this.remove(query, justOne || false, {}, cbfn);
    }
    opts = opts || {};
    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.remove(self.fullColName(), [{ q: query, limit: justOne ? 1 : 0 }], opts.writeConcern || DEFAULT_WRITE_OPTS, function (err, res) {
        if (err) return cb(err);
        cb(null, res.result)
      });
    });
  }

  drop(cb) {
    this.runCommand('drop', cb);
  }

  mapReduce(map, reduce, opts, cb: CallbackType) {
    this.runCommand('mapReduce', {
      map: map.toString(),
      reduce: reduce.toString(),
      query: opts.query || {},
      out: opts.out
    }, cb);
  }

  runCommand(cmd, opts, cb?: CallbackType) {
    if (typeof opts === 'function') return this.runCommand(cmd, null, opts);
    var self = this;
    opts = opts || {};

    var cmdObject = {};
    cmdObject[cmd] = this.name;
    Object.keys(opts).forEach(function (key) {
      cmdObject[key] = opts[key];
    });
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.command(self.dbName + '.$cmd', cmdObject, function (err, result) {
        if (err) return cb(err);
        cb(null, result.result);
      });
    });
  }

  toString(): string {
    return this.name;
  }

  dropIndexes(cb: CallbackType) {
    this.runCommand('dropIndexes', { index: '*' }, cb);
  }

  dropIndex(index, cb: CallbackType) {
    this.runCommand('dropIndexes', { index: index }, cb);
  }

  createIndex(index, opts, cb?: CallbackType) {
    if (typeof opts === 'function') return this.createIndex(index, {}, opts);
    if (typeof opts === 'undefined') return this.createIndex(index, {}, noop);
    opts.name = indexName(index);
    opts.key = index;
    this.runCommand('createIndexes', { indexes: [opts] }, cb);
  }

  ensureIndex(index, opts, cb: CallbackType) {
    this.createIndex(index, opts, cb);
  }

  getIndexes(cb: CallbackType) {
    var cursor = new Cursor({
      query: { ns: this.fullColName() },
      projection: {},
      onserver: this._getServer,
      fullCollectionName: this.dbName + '.system.indexes'
    });

    cursor.toArray(cb);
  }

  reIndex(cb: CallbackType) {
    this.runCommand('reIndex', cb);
  }

  isCapped(cb: CallbackType) {
    var cursor = new Cursor({
      query: { name: this.fullColName() },
      projection: {},
      onserver: this._getServer,
      fullCollectionName: this.dbName + '.system.namespaces'
    });

    cursor.toArray(function (err, cols) {
      if (err) return cb(err);
      cb(null,(cols[0].options && cols[0].options.capped) || false);
    });
  }

  stats(cb: CallbackType) {
    this.runCommand('collStats', cb);
  }

  group(doc, cb: CallbackType) {
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

    if (doc.finalize) cmd.group['finalize'] = new Code(doc.finalize.toString());
    if (doc.keys) {
      cmd.group.$keyf = new Code(doc.keys.toString());
      delete cmd.group.key;
    } else {
      delete cmd.group.$keyf;
    }

    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.command(self.dbName + '.$cmd', cmd, function (err, result) {
        if (err) return cb(err);
        cb(null, result.result.retval);
      });
    });
  }

  aggregate(): IAggregationCursor {
    var cb: CallbackType;
    var pipeline = Array.prototype.slice.call(arguments);
    if (typeof pipeline[pipeline.length - 1] === 'function') {
      cb = once(pipeline.pop());
    }

    if (cb) {
      this.runCommand('aggregate', { pipeline: pipeline }, function (err, res) {
        if (err) return cb(err);
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
  }

  initializeOrderedBulkOp(): IBulk {
    return new Bulk(this.name, true, this._getServer, this.dbName);
  }

  initializeUnorderedBulkOp(): IBulk {
    return new Bulk(this.name, false, this._getServer, this.dbName);
  }

}

export = Collection;
