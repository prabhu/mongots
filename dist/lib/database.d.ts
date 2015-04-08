import Collection = require('./collection');
declare class Database {
    private _getServer;
    private _dbname;
    private ObjectId;
    constructor(name: string, cols: Array<string>, onserver: any);
    collection(colName: string): Collection;
    close(cb: any): void;
    runCommand(opts: any, cb?: any): void;
    getCollectionNames(cb: any): void;
    createCollection(name: string, opts: any, cb: any): any;
    stats(scale: any, cb: any): any;
    dropDatabase(cb: any): void;
    createUser(usr: any, cb: any): void;
    addUser(usr: any, cb: any): void;
    dropUser(username: string, cb: any): void;
    removeUser(username: string, cb: any): void;
    eval(fn: any): void;
    getLastErrorObj(cb: any): void;
    getLastError(cb: any): void;
    toString(): string;
}
export = Database;
