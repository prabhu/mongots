/// <reference path="../../Scripts/typings/node/node.d.ts" />
/// <reference path="../../src/lib/interface/IAggregationCursor.d.ts" />
import Cursor = require('./cursor');
declare class AggregationCursor extends Cursor implements IAggregationCursor {
    constructor(opts: any);
}
export = AggregationCursor;
