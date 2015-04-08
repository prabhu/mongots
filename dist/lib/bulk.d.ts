/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/IBulk.d.ts" />
declare class Bulk implements IBulk {
    colName: string;
    cmdList: Array<any>;
    currCmd: any;
    ordered: boolean;
    _onserver: any;
    dbName: string;
    constructor(colName: string, ordered: boolean, onserver: any, dbname: string);
    find(query: any): {
        remove: () => void;
        removeOne: () => void;
        update: (updObj: any) => void;
        updateOne: (updObj: any) => void;
    };
    insert(doc: any): void;
    tojson(): {
        nInsertOps: number;
        nUpdateOps: number;
        nRemoveOps: number;
        nBatches: number;
    };
    execute(cb: CallbackType): void;
}
export = Bulk;
