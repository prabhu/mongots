var insert = require('./insert');
var mongots = require('../../dist/index');
var admindb = mongots('admin');

insert('maxTimeMS test', [{
  hello:'world'
}], function(db, t, done) {
	admindb.runCommand({configureFailPoint: "maxTimeAlwaysTimeOut", mode: "alwaysOn"}, function(err, result) {
	  db.a.find({"$where": "sleep(100) || true"}).maxTimeMS(10, function(err, docs) {
	    t.ok(err != null);
	    admindb.runCommand({configureFailPoint: "maxTimeAlwaysTimeOut", mode: "off"}, function(err, result) {
	    	db.a.find().maxTimeMS(10, function(err, docs){
			    t.equal(docs.length, 1);
			    t.equal(docs[0].hello, 'world');
			    done();
		    });
		  });
	  });
	});

});
