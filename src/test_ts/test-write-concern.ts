/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');
import mongots = require('../index');
import Database = require('../lib/database');
var db : any = mongots('tstest', ['test123']);

describe("Write concern test", () => {

  it("should insert with write concern option",() => {
    db.test123.insert({foo: 'bar'}, {writeConcern: {w: 0}}, function (err) {
      assert.ok(!err, 'Insert operation has failed');
    });
  });

  it("should insert with write concern option and ordered",() => {
    db.test123.insert({foo: 'bar'}, {writeConcern: {w: 0}, ordered: true}, function (err) {
      assert.ok(!err, 'Insert operation has failed');
    });
  });

  it("should update with write concern option",() => {
    db.test123.update({ foo: 'bar' }, { $set: { foo: 'newbar' } }, {writeConcern: {w: 0}}, function (err) {
      assert.ok(!err, 'Update operation has failed');
    });
  });

  it("should save with write concern option",() => {
    db.test123.save({ foo: 'bar' }, function (err, doc) {
      assert.ok(!err);
      assert.ok(doc._id);
      db.test123.save({ _id: doc._id, foo: 'newbar' }, { writeConcern: { w: 1 } }, function(err, ndoc) {
        assert.ok(!err, 'Update operation has failed');
      });
    });
  });

  it("should remove with write concern option and ordered",() => {
    db.test123.remove({ foo: 'bar' }, {writeConcern: {w: 1}}, function (err) {
      assert.ok(!err, 'Remove operation has failed');
    });
  });
});
