/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');
import mongots = require('../index');
import Database = require('../lib/database');
var db : any = mongots('tstest', ['b.c']);

describe("Chained collection names test", () => {  

  it("should work with collection name chaining", () => {
    db.b.c.remove(function() {
      db.b.c.save({hello: "world"}, function(err, rs) {
        db.b.c.find(function(err, docs) {
          assert.equal(docs[0].hello, "world");
          db.b.c.remove(function(err) {
            assert.ok(!err, 'Collection remove has failed');
          });
        });
      });
    });  
  });
  
});
