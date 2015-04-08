var test = require('./tape');
var mongots = require('../dist/index');
var db = mongots('test');

test('proxy', function(t) {
  if (typeof Proxy === 'undefined') return t.end();

  db.a.remove(function() {
    db.a.insert({hello: 'world'}, function() {
      db.a.findOne(function(err, doc) {
        t.equal(doc.hello, 'world');
        t.end();
      });
    });
  });
});
