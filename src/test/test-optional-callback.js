var test = require('./tape');
var mongots = require('../../dist/index');
var db = mongots('test', ['a','b']);

test('optional callback', function(t) {
  db.a.ensureIndex({hello:'world'})
  setTimeout(function() {
    db.a.count(function() {
      db.close(t.end.bind(t));
    })
  }, 100);
});
