var test = require('./tape');
var mongots = require('../../dist/index');
var db = mongots('test', ['a', 'mycappedcol']);

test('isCapped', function(t) {
  db.mycappedcol.drop(function(err) {
    db.createCollection('mycappedcol', {capped: true, size: 1024}, function(err) {
      t.notOk(err);
      db.mycappedcol.isCapped(function(err, ic) {
        t.notOk(err);
        t.ok(ic);
        db.a.insert({}, function(err) {
          t.notOk(err);
          db.a.isCapped(function(err, ic2) {
            t.notOk(ic2);
            db.mycappedcol.drop(t.end.bind(t));
          });
        });
      });
    });
  });
});
