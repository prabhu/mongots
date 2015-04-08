/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');
import mongots = require('../index');
import Database = require('../lib/database');
var db : any = mongots('tstest', ['test123']);

describe("Create Collection test", () => {
  before(() => {
    db.test123.drop();
  });

  it("should create collection if not exists",() => {
    db.createCollection('test123', function (err) {
      assert.ok(!err, 'Create collection has failed');
    });    
  });

  it("should fail if collection exists",() => {
    db.createCollection('test123', function (err) {
      assert.ok(err, 'Create collection should fail');
    });    
  });
});
