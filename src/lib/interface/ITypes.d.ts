interface CallbackType {
  (err: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void;
}

interface WriteConcernType {
  w?: number | string;
  j?: boolean;
  wtimeout?: number;
}

// Based on http://docs.mongodb.org/manual/reference/method/db.collection.save/#db.collection.save
interface SaveOptionsType {
  writeConcern?: WriteConcernType;
}

// Based on http://docs.mongodb.org/manual/reference/method/db.collection.insert/#db.collection.insert
interface InsertOptionsType extends SaveOptionsType {
  ordered?: boolean;
}

// Based on http://docs.mongodb.org/manual/reference/method/db.collection.update/#db.collection.update
// In addition, the driver requires two more parameters q and u
interface UpdateOptionsType {
  q?: string;
  u?: string;
  upsert?: boolean;
  multi?: boolean;
  writeConcern?: WriteConcernType;
}

// Based on http://docs.mongodb.org/manual/reference/method/db.collection.remove/#db.collection.remove
interface RemoveOptionsType {
  justOne?: boolean;
  writeConcern?: WriteConcernType;
}

// Based on https://github.com/christkv/mongodb-core/blob/master/lib/topologies/server.js#L433
interface ServerOptions {
  reconnect?: boolean;
  reconnectTries?: number;
  reconnectInterval?: number;
  emitError?: boolean;
  host?: string;
  port?: number;
  keepAlive?: boolean;
  keepAliveInitialDelay?: number;
  noDelay?: boolean;
  connectionTimeout?: number;
  socketTimeout?: number;
  singleBufferSerializtion?: boolean;
  ssl?: boolean;
  ca?: Buffer;
  cert?: Buffer;
  key?: Buffer;
  passphrase?: string;
  rejectUnauthorized?: boolean;
  promoteLongs?: boolean;
}

// Based on https://github.com/christkv/mongodb-core/blob/master/lib/topologies/replset.js#L65
interface ReplicaOptions extends ServerOptions {
  setName?: string;
  secondaryOnlyConnectionAllowed?: boolean;
  haInterval?: number;
  pingInterval?: number;
  acceptableLatency?: number;
}
