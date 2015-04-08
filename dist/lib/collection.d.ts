/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/ITypes.d.ts" />
/// <reference path="../../src/lib/interface/ICollection.d.ts" />
/// <reference path="../../src/lib/interface/ICursor.d.ts" />
/// <reference path="../../src/lib/interface/IAggregationCursor.d.ts" />
/// <reference path="../../src/lib/interface/IBulk.d.ts" />
declare class Collection implements ICollection {
    name: string;
    dbName: string;
    _getServer: any;
    constructor(name: string, dbname: string, getServer: any);
    fullColName(): string;
    find(query: any, projection?: any, cb?: CallbackType): ICursor;
    findOne(query: any, projection?: any, cb?: CallbackType): any;
    findAndModify(opts: any, cb: CallbackType): void;
    count(query: any, cb?: CallbackType): any;
    distinct(field: any, query: any, cb: CallbackType): void;
    insert(docOrDocs: any, cb?: CallbackType): void;
    update(query: any, update: any, opts: any, cb?: CallbackType): any;
    save(doc: any, cb?: CallbackType): void;
    remove(query: any, justOne: any, cb: CallbackType): any;
    drop(cb: any): void;
    mapReduce(map: any, reduce: any, opts: any, cb: CallbackType): void;
    runCommand(cmd: any, opts: any, cb?: CallbackType): any;
    toString(): string;
    dropIndexes(cb: CallbackType): void;
    dropIndex(index: any, cb: CallbackType): void;
    createIndex(index: any, opts: any, cb?: CallbackType): any;
    ensureIndex(index: any, opts: any, cb: CallbackType): void;
    getIndexes(cb: CallbackType): void;
    reIndex(cb: CallbackType): void;
    isCapped(cb: CallbackType): void;
    stats(cb: CallbackType): void;
    group(doc: any, cb: CallbackType): void;
    aggregate(): IAggregationCursor;
    initializeOrderedBulkOp(): IBulk;
    initializeUnorderedBulkOp(): IBulk;
}
export = Collection;
