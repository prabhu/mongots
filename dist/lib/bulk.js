var mongodb = require('mongodb-core');
var each = require('each-series');
var oid = mongodb.BSON.ObjectID.createPk;
var cmdkeys = {
    insert: 'nInserted',
    delete: 'nRemoved',
    update: 'nUpserted'
};
var Bulk = (function () {
    function Bulk(colName, ordered, onserver, dbname) {
        this._colname = colName;
        this._cmds = [];
        this._currCmd = null;
        this._ordered = ordered;
        this._onserver = onserver;
        this._dbname = dbname;
    }
    Bulk.prototype.find = function (query) {
        var self = this;
        var removeFn = function (lim) {
            if (!self._currCmd) {
                self._currCmd = {
                    delete: self._colname,
                    deletes: [],
                    ordered: self._ordered,
                    writeConcern: { w: 1 }
                };
            }
            if (!self._currCmd.delete) {
                self._cmds.push(self._currCmd);
                self._currCmd = {
                    delete: self._colname,
                    deletes: [],
                    ordered: self._ordered,
                    writeConcern: { w: 1 }
                };
            }
            self._currCmd.deletes.push({ q: query, limit: lim });
        };
        var updateFn = function (updObj, multi) {
            if (!self._currCmd) {
                self._currCmd = {
                    update: self._colname,
                    updates: [],
                    ordered: self._ordered,
                    writeConcern: { w: 1 }
                };
            }
            if (!self._currCmd.update) {
                self._cmds.push(self._currCmd);
                self._currCmd = {
                    update: self._colname,
                    updates: [],
                    ordered: self._ordered,
                    writeConcern: { w: 1 }
                };
            }
            self._currCmd.updates.push({ q: query, u: updObj, multi: multi, upsert: false });
        };
        var findobj = {
            remove: function () {
                removeFn(0);
            },
            removeOne: function () {
                removeFn(1);
            },
            update: function (updObj) {
                updateFn(updObj, true);
            },
            updateOne: function (updObj) {
                updateFn(updObj, false);
            }
        };
        return findobj;
    };
    Bulk.prototype.insert = function (doc) {
        if (!this._currCmd) {
            this._currCmd = {
                insert: this._colname,
                documents: [],
                ordered: this._ordered,
                writeConcern: { w: 1 }
            };
        }
        if (!this._currCmd.insert) {
            this._cmds.push(this._currCmd);
            this._currCmd = {
                insert: this._colname,
                documents: [],
                ordered: this._ordered,
                writeConcern: { w: 1 }
            };
        }
        if (!doc._id) {
            doc._id = oid();
        }
        this._currCmd.documents.push(doc);
    };
    Bulk.prototype.tojson = function () {
        var obj = {
            nInsertOps: 0,
            nUpdateOps: 0,
            nRemoveOps: 0,
            nBatches: this._cmds.length
        };
        this._cmds.forEach(function (cmd) {
            if (cmd.update) {
                obj.nUpdateOps += cmd.updates.length;
            }
            else if (cmd.insert) {
                obj.nInsertOps += cmd.documents.length;
            }
            else if (cmd.delete) {
                obj.nRemoveOps += cmd.deletes.length;
            }
        });
        return obj;
    };
    Bulk.prototype.execute = function (cb) {
        var self = this;
        var result = {
            writeErrors: [],
            writeConcernErrors: [],
            nInserted: 0,
            nUpserted: 0,
            nMatched: 0,
            nModified: 0,
            nRemoved: 0,
            upserted: [],
            ok: 0
        };
        this._cmds.push(this._currCmd);
        this._onserver(function (err, server) {
            if (err) {
                return cb(err);
            }
            each(self._cmds, function (cmd, i, done) {
                server.command(self._dbname + '.$cmd', cmd, function (err, res) {
                    if (err)
                        return done(err);
                    result[cmdkeys[Object.keys(cmd)[0]]] += res.result.n;
                    done();
                });
            }, function (err) {
                if (err)
                    return cb(err);
                result.ok = 1;
                cb(null, result);
            });
        });
    };
    return Bulk;
})();
;
module.exports = Bulk;
//# sourceMappingURL=bulk.js.map