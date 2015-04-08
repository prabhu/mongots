import Database = require('./lib/database');
declare var init: (connString: any, cols: string[]) => Database;
export = init;
