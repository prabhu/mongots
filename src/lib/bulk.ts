/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='./interface/IBulk.d.ts' />
var mongodb = require('mongodb-core');
var each = require('each-series');

var oid = mongodb.BSON.ObjectID.createPk;

var cmdkeys = {
  insert: 'nInserted',
  delete: 'nRemoved',
  update: 'nUpserted'
};

class Bulk implements IBulk {
  colName: string;
  cmdList: Array<any>;
  currCmd: any;
  ordered: boolean;
  _onserver: any;
  dbName: string;

  constructor(colName: string, ordered: boolean, onserver: any, dbname: string) {
    this.colName = colName;
    this.cmdList = [];
    this.currCmd = null;
    this.ordered = ordered;
    this._onserver = onserver;
    this.dbName = dbname;
  }

  find(query: any) {
    var self = this;
    var removeFn = function (lim: number): void {
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

    var updateFn = function (updObj: any, multi: boolean): void {
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

      update: function (updObj: any) {
        updateFn(updObj, true);
      },

      updateOne: function (updObj: any) {
        updateFn(updObj, false);
      }
    };

    return findobj;
  }

  insert(doc: any) {
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
  }

  tojson() {
    var obj = {
      nInsertOps: 0,
      nUpdateOps: 0,
      nRemoveOps: 0,
      nBatches: this.cmdList.length
    };

    this.cmdList.forEach(function (cmd: any) {
      if (cmd.update) {
        obj.nUpdateOps += cmd.updates.length;
      } else if (cmd.insert) {
        obj.nInsertOps += cmd.documents.length;
      } else if (cmd.delete) {
        obj.nRemoveOps += cmd.deletes.length;
      }
    });

    return obj;
  }

  execute(cb: CallbackType) {
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
    this._onserver(function (err: any, server: any) {
      if (err) {
        return cb(err);
      }
      each(self.cmdList, function (cmd: any, i: number, done: any) {
        server.command(self.dbName + '.$cmd', cmd, function (err: any, res: any) {
          if (err) return done(err);
          result[cmdkeys[Object.keys(cmd)[0]]] += res.result.n;
          done();
        });
      }, function (err) {
          if (err) return cb(err);
          result.ok = 1;
          cb(null, result);
        });
    });
  }
};
export = Bulk;
