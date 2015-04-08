var assert = require('assert');
var cp = require('child_process');
describe("Crash test", function () {
    it("should handle crash", function () {
        var proc = cp.spawn('node', ['./crash.js']);
        proc.on('exit', function (code) {
            assert.notEqual(code, 0);
        });
    });
});
//# sourceMappingURL=test-crash.js.map