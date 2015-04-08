/// <reference path="../../Scripts/typings/node/node.d.ts" />
import Cursor = require('./cursor');
import AggregationCursor = require('./aggregation-cursor');
import Bulk = require('./bulk');
declare class Collection {
    private _name;
    private _dbname;
    private _getServer;
    constructor(name: string, dbname: string, getServer: any);
    _fullColName(): string;
    find(query: any, projection?: any, cb?: any): Cursor;
    findOne(query: any, projection: any, cb: any): any;
    findAndModify(opts: any, cb: any): void;
    count(query: any, cb: any): any;
    distinct(field: any, query: any, cb: any): void;
    insert(docOrDocs: any, cb: any): void;
    update(query: any, update: any, opts: any, cb: any): any;
    save(doc: any, cb: any): void;
    remove(query: any, justOne: any, cb: any): any;
    drop(cb: any): void;
    mapReduce(map: any, reduce: any, opts: any, cb: any): void;
    runCommand(cmd: any, opts: any, cb?: any): any;
    toString(): string;
    dropIndexes(cb: any): void;
    dropIndex(index: any, cb: any): void;
    createIndex(index: any, opts: any, cb: any): any;
    ensureIndex(index: any, opts: any, cb: any): void;
    getIndexes(cb: any): void;
    reIndex(cb: any): void;
    isCapped(cb: any): void;
    stats(cb: any): void;
    group(doc: any, cb: any): void;
    aggregate(): AggregationCursor;
    initializeOrderedBulkOp(): Bulk;
    initializeUnorderedBulkOp(): Bulk;
}
export = Collection;
