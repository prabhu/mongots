var assert = require('assert');
var mongots = require('../index');
var db = mongots('tstest', ['b.c']);
describe("Chained collection names test", function () {
    it("should work with collection name chaining", function () {
        db.b.c.remove(function () {
            db.b.c.save({ hello: "world" }, function (err, rs) {
                db.b.c.find(function (err, docs) {
                    assert.equal(docs[0].hello, "world");
                    db.b.c.remove(function (err) {
                        assert.ok(!err, 'Collection remove has failed');
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=test-chained-collection-names.js.map