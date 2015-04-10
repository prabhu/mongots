/// <reference path='../../Scripts/typings/node/node.d.ts' />
/// <reference path='../../Scripts/typings/node/mocha.d.ts' />
import assert = require('assert');
import mongots = require('../index');
import Database = require('../lib/database');
// Read the ca
var ca = [fs.readFileSync(__dirname + "/ssl/ca.pem")];
var cert = fs.readFileSync(__dirname + "/ssl/client.pem");
var key = fs.readFileSync(__dirname + "/ssl/client.pem");

describe("SSL test", () => {
	it('should support ssl', function() {
    var db : any = mongots('mongodb://localhost:27017/tstest?ssl=true', ['test123'], {
      rejectUnauthorized: true,
      sslValidate: true,
      ca: ca,
      key: key,
      cert: cert
    });

	});
});
