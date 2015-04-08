/// <reference path='./ITypes.d.ts' />
/// <reference path='./ICollection.d.ts' />

interface IDatabase {
  // properties
  dbName: string;
  ObjectId;

  // methods
  // to-mongodb-core requires this and another 3 magical methods to work.
  // FIXME: remove to-mongodb-core dependency
  _getServer();

  collection(colName: string): ICollection;
  close(cb: CallbackType);
  runCommand(opts: any, cb?: CallbackType);
  getCollectionNames(cb: CallbackType);
  createCollection(name: string, opts, cb?: CallbackType);
  stats(scale, cb: CallbackType);
  dropDatabase(cb: CallbackType);
  createUser(usr, cb: CallbackType);
  addUser(usr, cb: CallbackType);
  dropUser(username: string, cb: CallbackType);
  removeUser(username: string, cb: CallbackType);
  eval(fn);
  getLastErrorObj(cb: CallbackType);
  getLastError(cb: CallbackType);
  toString(): string;
}
