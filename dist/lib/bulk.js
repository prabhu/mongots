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
        this.colName = colName;
        this.cmdList = [];
        this.currCmd = null;
        this.ordered = ordered;
        this._onserver = onserver;
        this.dbName = dbname;
    }
    Bulk.prototype.find = function (query) {
        var self = this;
        var removeFn = function (lim) {
            if (!self.currCmd) {
                self.currCmd = {
                    delete: self.colName,
                    deletes: [],
                    ordered: self.ordered,
                    writeConcern: { w: 1 }
                };
            }
            if (!self.currCmd.delete) {
                self.cmdList.push(self.currCmd);
                self.currCmd = {
                    delete: self.colName,
                    deletes: [],
                    ordered: self.ordered,
                    writeConcern: { w: 1 }
                };
            }
            self.currCmd.deletes.push({ q: query, limit: lim });
        };
        var updateFn = function (updObj, multi) {
            if (!self.currCmd) {
                self.currCmd = {
                    update: self.colName,
                    updates: [],
                    ordered: self.ordered,
                    writeConcern: { w: 1 }
                };
            }
            if (!self.currCmd.update) {
                self.cmdList.push(self.currCmd);
                self.currCmd = {
                    update: self.colName,
                    updates: [],
                    ordered: self.ordered,
                    writeConcern: { w: 1 }
                };
            }
            self.currCmd.updates.push({ q: query, u: updObj, multi: multi, upsert: false });
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
        if (!this.currCmd) {
            this.currCmd = {
                insert: this.colName,
                documents: [],
                ordered: this.ordered,
                writeConcern: { w: 1 }
            };
        }
        if (!this.currCmd.insert) {
            this.cmdList.push(this.currCmd);
            this.currCmd = {
                insert: this.colName,
                documents: [],
                ordered: this.ordered,
                writeConcern: { w: 1 }
            };
        }
        if (!doc._id) {
            doc._id = oid();
        }
        this.currCmd.documents.push(doc);
    };
    Bulk.prototype.tojson = function () {
        var obj = {
            nInsertOps: 0,
            nUpdateOps: 0,
            nRemoveOps: 0,
            nBatches: this.cmdList.length
        };
        this.cmdList.forEach(function (cmd) {
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
        this.cmdList.push(this.currCmd);
        this._onserver(function (err, server) {
            if (err) {
                return cb(err);
            }
            each(self.cmdList, function (cmd, i, done) {
                server.command(self.dbName + '.$cmd', cmd, function (err, res) {
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