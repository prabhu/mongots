/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/ITypes.d.ts" />
/// <reference path="../../src/lib/interface/ICursor.d.ts" />
declare class Cursor implements ICursor {
    _opts: any;
    _get: any;
    destroy: any;
    _read: any;
    next: any;
    rewind: any;
    toArray: any;
    map: any;
    query: any;
    limit: any;
    skip: any;
    batchSize: any;
    sort: any;
    count: any;
    size: any;
    explain: any;
    forEach: any;
    constructor(opts: any);
}
export = Cursor;
