/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');
import mongots = require('../index');
import Database = require('../lib/database');
var db : any = mongots('localhost', ['test']);

db.test.findOne(function() {
  throw new Error('I should crash the program');
});

setTimeout(function() {
  throw new Error('timeout');
}, 5000);
