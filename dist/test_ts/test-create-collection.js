var assert = require('assert');
var mongots = require('../index');
var db = mongots('tstest', ['test123']);
describe("Create Collection test", function () {
    before(function () {
        db.test123.drop();
    });
    it("should create collection if not exists", function () {
        db.createCollection('test123', function (err) {
            assert.ok(!err, 'Create collection has failed');
        });
    });
    it("should fail if collection exists", function () {
        db.createCollection('test123', function (err) {
            assert.ok(err, 'Create collection should fail');
        });
    });
});
//# sourceMappingURL=test-create-collection.js.map