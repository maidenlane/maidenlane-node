"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitstampRealTimeFeed = void 0;
const got_1 = __importDefault(require("got"));
const realtimefeed_1 = require("./realtimefeed");
class BitstampRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ws.bitstamp.net';
        this.httpURL = 'https://www.bitstamp.net/api/v2';
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('BitstampRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                return {
                    event: 'bts:subscribe',
                    data: {
                        channel: `${filter.channel}_${symbol}`
                    }
                };
            });
        })
            .flatMap((c) => c);
    }
    messageIsError(message) {
        if (message.channel === undefined) {
            return true;
        }
        if (message.event === 'bts:request_reconnect') {
            return true;
        }
        return false;
    }
    async provideManualSnapshots(filters, shouldCancel) {
        const orderBookFilter = filters.find((f) => f.channel === 'diff_order_book');
        if (!orderBookFilter) {
            return;
        }
        this.debug('requesting manual snapshots for: %s', orderBookFilter.symbols);
        for (let symbol of orderBookFilter.symbols) {
            if (shouldCancel()) {
                return;
            }
            const depthSnapshotResponse = await got_1.default.get(`${this.httpURL}/order_book/${symbol}?group=1`).json();
            const snapshot = {
                data: depthSnapshotResponse,
                event: 'snapshot',
                channel: `diff_order_book_${symbol}`,
                generated: true
            };
            this.manualSnapshotsBuffer.push(snapshot);
        }
        this.debug('requested manual snapshots successfully for: %s ', orderBookFilter.symbols);
    }
}
exports.BitstampRealTimeFeed = BitstampRealTimeFeed;
//# sourceMappingURL=bitstamp.js.map