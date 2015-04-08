/// <reference path='./ITypes.d.ts' />
/// <reference path='./ICursor.d.ts' />
/// <reference path='./IAggregationCursor.d.ts' />
/// <reference path='./IBulk.d.ts' />

interface ICollection {

  // properties
  name: string;
  dbName: string;
  _getServer: any;

  // methods
  fullColName(): string;
  find(query, projection?, cb?: CallbackType): ICursor;
  findOne(query, projection?, cb?: CallbackType);
  findAndModify(opts, cb: CallbackType);

  count(query, cb?: CallbackType);
  distinct(field, query, cb: CallbackType);

  insert(docOrDocs, cb?: CallbackType);
  update(query, update, opts, cb?: CallbackType);
  save(doc, cb?: CallbackType);
  remove(query, justOne, cb: CallbackType);

  drop(cb);
  mapReduce(map, reduce, opts, cb: CallbackType);
  runCommand(cmd, opts, cb?: CallbackType);

  toString(): string;
  dropIndexes(cb: CallbackType);
  dropIndex(index, cb: CallbackType);
  createIndex(index, opts, cb?: CallbackType);
  ensureIndex(index, opts, cb: CallbackType);
  getIndexes(cb: CallbackType);
  reIndex(cb: CallbackType);
  isCapped(cb: CallbackType);
  stats(cb: CallbackType);

  group(doc, cb: CallbackType);
  aggregate(): IAggregationCursor;

  initializeOrderedBulkOp(): IBulk;
  initializeUnorderedBulkOp(): IBulk;

}
