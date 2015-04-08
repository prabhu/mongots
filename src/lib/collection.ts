declare function require(name: string);
var mongodb = require('mongodb-core');
var once = require('once');
import Cursor = require('./cursor');
import AggregationCursor = require('./aggregation-cursor');
import Bulk = require('./bulk');

var writeOpts = { writeConcern: { w: 1 }, ordered: true };
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

class Collection {
  private _name: string;
  private _dbname: string;
  private _getServer: any;

  constructor(opts: any, getServer: any) {
    this._name = opts.name;
    this._dbname = opts.dbname;
    this._getServer = getServer;
  }

  _fullColName(): string {
    return this._dbname + '.' + this._name;
  }

  find(query, projection?, cb?): Cursor {
    if (typeof query === 'function') return this.find({}, null, query);
    if (typeof projection === 'function') return this.find(query, null, projection);

    var cursor = new Cursor({
      query: query,
      projection: projection,
      onserver: this._getServer,
      fullCollectionName: this._fullColName()
    });

    if (cb) {
      cursor.toArray(cb);
      return null;
    }
    return cursor;
  }

  findOne(query, projection, cb) {
    if (typeof query === 'function') return this.findOne({}, null, query);
    if (typeof projection === 'function') return this.findOne(query, null, projection);
    this.find(query, projection).next(function (err, doc) {
      if (err) return cb(err);
      cb(null, doc);
    });
  }

  findAndModify(opts, cb) {
    this.runCommand('findAndModify', opts, function (err, result) {
      if (err) return cb(err);
      cb(null, result.value, result.lastErrorObject || { n: 0 });
    });
  }

  count(query, cb) {
    if (typeof query === 'function') return this.count({}, query);
    this.find(query).count(cb);
  }

  distinct(field, query, cb) {
    this.runCommand('distinct', { key: field, query: query }, function (err, result) {
      if (err) return cb(err);
      cb(null, result.values);
    });
  }

  insert(docOrDocs, cb) {
    cb = cb || noop;
    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);

      var docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];
      for (var i = 0; i < docs.length; i++) {
        if (!docs[i]._id) docs[i]._id = oid();
      }
      server.insert(self._fullColName(), docs, writeOpts, function (err, res) {
        if (err) return cb(err);
        cb(null, docOrDocs);
      });
    });
  }

  update(query, update, opts, cb) {
    if (!opts && !cb) return this.update(query, update, {}, noop);
    if (typeof opts === 'function') return this.update(query, update, {}, opts);

    cb = cb || noop;
    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);

      opts.q = query;
      opts.u = update;
      server.update(self._fullColName(), [opts], writeOpts, function (err, res) {
        if (err) return cb(err);
        cb(null, res.result);
      });
    });
  }

  save(doc, cb) {
    cb = cb || noop;
    if (doc._id) {
      this.update({ _id: doc._id }, doc, { upsert: true }, function (err, result) {
        if (err) return cb(err);
        cb(null, doc);
      });
    } else {
      this.insert(doc, cb);
    }
  }

  remove(query, justOne, cb) {
    if (typeof query === 'function') return this.remove({}, false, query);
    if (typeof justOne === 'function') return this.remove(query, false, justOne);

    var self = this;
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.remove(self._fullColName(), [{ q: query, limit: justOne ? 1 : 0 }], writeOpts, function (err, res) {
        if (err) return cb(err);
        cb(null, res.result)
      });
    });
  }

  drop(cb) {
    this.runCommand('drop', cb);
  }

  mapReduce(map, reduce, opts, cb) {
    this.runCommand('mapReduce', {
      map: map.toString(),
      reduce: reduce.toString(),
      query: opts.query || {},
      out: opts.out
    }, cb);
  }

  runCommand(cmd, opts, cb?) {
    if (typeof opts === 'function') return this.runCommand(cmd, null, opts);
    var self = this;
    opts = opts || {};

    var cmdObject = {};
    cmdObject[cmd] = this._name;
    Object.keys(opts).forEach(function (key) {
      cmdObject[key] = opts[key];
    });
    this._getServer(function (err, server) {
      if (err) return cb(err);
      server.command(self._dbname + '.$cmd', cmdObject, function (err, result) {
        if (err) return cb(err);
        cb(null, result.result);
      });
    });
  }

  toString(): string {
    return this._name;
  }

  dropIndexes(cb) {
    this.runCommand('dropIndexes', { index: '*' }, cb);
  }

  dropIndex(index, cb) {
    this.runCommand('dropIndexes', { index: index }, cb);
  }

  createIndex(index, opts, cb) {
    if (typeof opts === 'function') return this.createIndex(index, {}, opts);
    if (typeof opts === 'undefined') return this.createIndex(index, {}, noop);
    opts.name = indexName(index);
    opts.key = index;
    this.runCommand('createIndexes', { indexes: [opts] }, cb);
  }

  ensureIndex(index, opts, cb) {
    this.createIndex(index, opts, cb);
  }

  getIndexes(cb) {
    var cursor = new Cursor({
      query: { ns: this._fullColName() },
      projection: {},
      onserver: this._getServer,
      fullCollectionName: this._dbname + '.system.indexes'
    });

    cursor.toArray(cb);
  }

  reIndex(cb) {
    this.runCommand('reIndex', cb);
  }

  isCapped(cb) {
    var cursor = new Cursor({
      query: { name: this._fullColName() },
      projection: {},
      onserver: this._getServer,
      fullCollectionName: this._dbname + '.system.namespaces'
    });

    cursor.toArray(function (err, cols) {
      if (err) return cb(err);
      cb(null,(cols[0].options && cols[0].options.capped) || false);
    });
  }

  stats(cb) {
    this.runCommand('collStats', cb);
  }

  group(doc, cb) {
    var cmd = {
      group: {
        ns: this._name,
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
      server.command(self._dbname + '.$cmd', cmd, function (err, result) {
        if (err) return cb(err);
        cb(null, result.result.retval);
      });
    });
  }

  aggregate(): AggregationCursor {
    var cb;
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
      colName: this._name,
      fullCollectionName: this._fullColName(),
      pipeline: pipeline
    });

    return strm;
  }

  initializeOrderedBulkOp(): Bulk {
    return new Bulk(this._name, true, this._getServer, this._dbname);
  }

  initializeUnorderedBulkOp(): Bulk {
    return new Bulk(this._name, false, this._getServer, this._dbname);
  }

}

export = Collection;
