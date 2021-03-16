/// <reference types="node" />
import { Transform, TransformCallback } from 'stream';
export declare class BinarySplitStream extends Transform {
    private readonly _NEW_LINE_BYTE;
    private _buffered?;
    constructor();
    _transform(chunk: Buffer, _: string, callback: TransformCallback): void;
}
//# sourceMappingURL=binarysplit.d.ts.map