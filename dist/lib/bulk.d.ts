/// <reference path="../../Scripts/typings/node/node.d.ts" />
declare class Bulk {
    private _colname;
    private _cmds;
    private _currCmd;
    private _ordered;
    private _onserver;
    private _dbname;
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
    execute(cb: any): void;
}
export = Bulk;
