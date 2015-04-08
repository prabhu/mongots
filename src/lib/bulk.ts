declare function require(name: string);
var mongodb = require('mongodb-core');
var each = require('each-series');

var oid = mongodb.BSON.ObjectID.createPk;

var cmdkeys = {
  insert: 'nInserted',
  delete: 'nRemoved',
  update: 'nUpserted'
};

class Bulk {
  private _colname: string;
  private _cmds: Array<any>;
  private _currCmd: any;
  private _ordered: boolean;
  private _onserver: any;
  private _dbname: string;

  constructor(colName: string, ordered: boolean, onserver: any, dbname: string) {
    this._colname = colName;
    this._cmds = [];
    this._currCmd = null;
    this._ordered = ordered;
    this._onserver = onserver;
    this._dbname = dbname;
  }

  find(query: any) {
    var self = this;
    var removeFn = function (lim: number): void {
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

    var updateFn = function (updObj: any, multi: boolean): void {
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
  }

  tojson() {
    var obj = {
      nInsertOps: 0,
      nUpdateOps: 0,
      nRemoveOps: 0,
      nBatches: this._cmds.length
    };

    this._cmds.forEach(function (cmd: any) {
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

  execute(cb: any) {
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
    this._onserver(function (err: any, server: any) {
      if (err) {
        return cb(err);
      }
      each(self._cmds, function (cmd: any, i: number, done: any) {
        server.command(self._dbname + '.$cmd', cmd, function (err: any, res: any) {
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
