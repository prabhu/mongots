var assert = require('assert');
var mongots = require('../index');
var db = mongots('tstest', ['test123']);
describe("Write concern test", function () {
    it("should insert with write concern option", function () {
        db.test123.insert({ foo: 'bar' }, { writeConcern: { w: 0 } }, function (err) {
            assert.ok(!err, 'Insert operation has failed');
        });
    });
    it("should insert with write concern option and ordered", function () {
        db.test123.insert({ foo: 'bar' }, { writeConcern: { w: 0 }, ordered: true }, function (err) {
            assert.ok(!err, 'Insert operation has failed');
        });
    });
    it("should update with write concern option", function () {
        db.test123.update({ foo: 'bar' }, { $set: { foo: 'newbar' } }, { writeConcern: { w: 0 } }, function (err) {
            assert.ok(!err, 'Update operation has failed');
        });
    });
    it("should save with write concern option", function () {
        db.test123.save({ foo: 'bar' }, function (err, doc) {
            assert.ok(!err);
            assert.ok(doc._id);
            db.test123.save({ _id: doc._id, foo: 'newbar' }, { writeConcern: { w: 1 } }, function (err, ndoc) {
                assert.ok(!err, 'Update operation has failed');
            });
        });
    });
    it("should remove with write concern option and ordered", function () {
        db.test123.remove({ foo: 'bar' }, { writeConcern: { w: 1 } }, function (err) {
            assert.ok(!err, 'Remove operation has failed');
        });
    });
});
//# sourceMappingURL=test-write-concern.js.map