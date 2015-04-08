var test = require('./tape');
var mongots = require('../dist/index');
var each = require('each-series');

test('receive a driver db or mongots instance', function(t) {

  var db = mongots(mongots('test', []), ['a']);
  var afterFind = function() {
    db.a.remove(function(err) {
      t.ok(!err);
      t.equal(db.toString(), 'test');
      t.end();
    });
  };

  var afterInsert = function(err) {
    t.ok(!err);

    db.a.findOne(function(err, data) {
      t.equal(data.name, 'Pidgey');
      afterFind();
    });
  };

  var afterRemove = function(err) {
    t.ok(!err);
    db.a.insert({name: 'Pidgey'}, afterInsert);
  };
  db.a.remove(afterRemove);

});
