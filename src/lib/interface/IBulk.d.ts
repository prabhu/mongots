/// <reference path='./ITypes.d.ts' />

interface IBulk {
  // properties
  colName: string;
  cmdList: Array<any>;
  currCmd: any;
  ordered: boolean;
  _onserver: any;
  dbName: string;

  // methods
  find(query: any);
  insert(doc: any);
  tojson();
  execute(cb: CallbackType);
}
