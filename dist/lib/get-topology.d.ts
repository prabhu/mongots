/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/ITypes.d.ts" />
declare var init: (connString: string, serverOptions?: ServerOptions | ReplicaOptions, cb?: any) => void;
export = init;
