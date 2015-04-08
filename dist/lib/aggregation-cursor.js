var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var thunky = require('thunky');
var Cursor = require('./cursor');
var AggregationCursor = (function (_super) {
    __extends(AggregationCursor, _super);
    function AggregationCursor(opts) {
        _super.call(this, opts);
        var onserver = this._opts.onserver;
        var self = this;
        this._get = thunky(function (cb) {
            onserver(function (err, server) {
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
    return AggregationCursor;
})(Cursor);
;
module.exports = AggregationCursor;
//# sourceMappingURL=aggregation-cursor.js.map