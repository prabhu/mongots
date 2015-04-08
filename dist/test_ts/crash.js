var mongots = require('../index');
var db = mongots('localhost', ['test']);
db.test.findOne(function () {
    throw new Error('I should crash the program');
});
setTimeout(function () {
    throw new Error('timeout');
}, 5000);
//# sourceMappingURL=crash.js.map