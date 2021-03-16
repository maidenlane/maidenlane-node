"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceDexRealTimeFeed = void 0;
const got_1 = __importDefault(require("got"));
const realtimefeed_1 = require("./realtimefeed");
class BinanceDexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://dex.binance.org/api/ws';
        this.httpURL = 'https://dex.binance.org/api/v1';
    }
    mapToSubscribeMessages(filters) {
        return filters
            .filter((f) => f.channel !== 'depthSnapshot')
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('BinanceDexRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return {
                method: 'subscribe',
                topic: filter.channel,
                symbols: filter.symbols
            };
        });
    }
    messageIsError(message) {
        if (message.stream === undefined) {
            return true;
        }
        return false;
    }
    async provideManualSnapshots(filters, shouldCancel) {
        const depthSnapshotFilter = filters.find((f) => f.channel === 'depthSnapshot');
        if (!depthSnapshotFilter) {
            return;
        }
        this.debug('requesting manual snapshots for: %s', depthSnapshotFilter.symbols);
        for (let symbol of depthSnapshotFilter.symbols) {
            if (shouldCancel()) {
                return;
            }
            const depthSnapshotResponse = (await got_1.default.get(`${this.httpURL}/depth?symbol=${symbol}&limit=1000`).json());
            const snapshot = {
                stream: `depthSnapshot`,
                generated: true,
                data: {
                    symbol,
                    ...depthSnapshotResponse
                }
            };
            this.manualSnapshotsBuffer.push(snapshot);
        }
        this.debug('requested manual snapshots successfully for: %s ', depthSnapshotFilter.symbols);
    }
}
exports.BinanceDexRealTimeFeed = BinanceDexRealTimeFeed;
//# sourceMappingURL=binancedex.js.map