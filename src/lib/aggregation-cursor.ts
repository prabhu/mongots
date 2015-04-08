/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='./interface/IAggregationCursor.d.ts' />
var thunky = require('thunky');
import Cursor = require('./cursor');

class AggregationCursor extends Cursor implements IAggregationCursor {

  constructor(opts: any) {
    super(opts);
    var onserver = this._opts.onserver;

    var self = this;
    this._get = thunky(function (cb: any) {
      onserver(function (err: any, server: any) {
        if (err) {
          return cb(err);
        }
        cb(null, server.cursor(self._opts.fullCollectionName, {
          aggregate: self._opts.colName,
          pipeline: self._opts.pipeline,
          cursor: { batchSize: 1000 }
        }, { cursor: { batchSize: 1000 } }));
      });
    });
  }
};

export = AggregationCursor;