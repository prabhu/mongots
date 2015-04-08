/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');

var cp = require('child_process');

describe("Crash test", () => {  

  it("should handle crash", () => {
    var proc = cp.spawn('node', ['./crash.js']);
    proc.on('exit', function(code) {
      assert.notEqual(code, 0);
    });
  });

});
