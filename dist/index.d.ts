/// <reference path="../Scripts/typings/node/node.d.ts" />
/// <reference path="../src/lib/interface/ITypes.d.ts" />
import Database = require('./lib/database');
declare var init: (connString: string | Database, collections?: string[], options?: ServerOptions | ReplicaOptions) => Database;
export = init;
