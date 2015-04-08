var test = require('./tape');
var mongots = require('../../dist/index');
var db = mongots('test', ['test123']);

test('createCollection', function(t) {
  db.test123.drop(function() {
    db.createCollection('test123', function(err) {
      t.ok(!err);
      db.createCollection('test123', function(err) {
        t.ok(err);
        t.end();
      });
    });
  });
});
