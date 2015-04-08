var test = require('./tape');
var mongots = require('../../dist/index');
var db = mongots('test', ['a']);

module.exports = function(testName, docs, testFn) {
  test(testName, function(t) {
    db.a.remove(function(err) {
      t.ok(!err);

      db.a.insert(docs, function(err) {
        t.ok(!err);
        testFn(db, t, function() {
          db.a.remove(function(err) {
            t.ok(!err);
            t.end();
          });
        });
      });

    });
  });
};

module.exports.skip = function(testName) {
  test.skip(testName, function(t) {
    t.end();
  });
};
