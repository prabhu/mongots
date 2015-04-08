/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/ITypes.d.ts" />
/// <reference path="../../src/lib/interface/IDatabase.d.ts" />
/// <reference path="../../src/lib/interface/ICollection.d.ts" />
import Collection = require('./collection');
declare class Database implements IDatabase {
    _getServer: any;
    dbName: string;
    ObjectId: any;
    constructor(name: string, cols: Array<string>, onserver: any);
    collection(colName: string): Collection;
    close(cb: any): void;
    runCommand(opts: any, cb?: CallbackType): void;
    getCollectionNames(cb: CallbackType): void;
    createCollection(name: string, opts: any, cb?: CallbackType): any;
    stats(scale: any, cb: CallbackType): any;
    dropDatabase(cb: CallbackType): void;
    createUser(usr: any, cb: CallbackType): void;
    addUser(usr: any, cb: CallbackType): void;
    dropUser(username: string, cb: CallbackType): void;
    removeUser(username: string, cb: CallbackType): void;
    eval(fn: any): void;
    getLastErrorObj(cb: CallbackType): void;
    getLastError(cb: CallbackType): void;
    toString(): string;
}
export = Database;
