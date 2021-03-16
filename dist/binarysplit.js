"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinarySplitStream = void 0;
const stream_1 = require("stream");
// inspired by https://github.com/maxogden/binary-split/blob/master/index.js
class BinarySplitStream extends stream_1.Transform {
    constructor() {
        super({
            readableObjectMode: true
        });
        this._NEW_LINE_BYTE = 10;
        this._buffered = undefined;
    }
    _transform(chunk, _, callback) {
        let offset = 0;
        let lastMatch = 0;
        let bufferToSplit = chunk;
        // if we already had something remaining in the buffer let's concat it with current chunk
        if (this._buffered) {
            bufferToSplit = Buffer.concat([this._buffered, chunk]);
            offset = this._buffered.length;
            this._buffered = undefined;
        }
        while (true) {
            let newLineIndex = bufferToSplit.indexOf(this._NEW_LINE_BYTE, offset);
            if (newLineIndex !== -1) {
                this.push(bufferToSplit.slice(lastMatch, newLineIndex));
                offset = newLineIndex + 1;
                lastMatch = offset;
            }
            else {
                this._buffered = bufferToSplit.slice(lastMatch);
                break;
            }
        }
        callback();
    }
}
exports.BinarySplitStream = BinarySplitStream;
//# sourceMappingURL=binarysplit.js.map