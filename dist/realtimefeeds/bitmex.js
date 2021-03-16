"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmexRealTimeFeed = void 0;
const handy_1 = require("../handy");
const realtimefeed_1 = require("./realtimefeed");
class BitmexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://www.bitmex.com/realtime';
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                return [
                    {
                        op: 'subscribe',
                        args: [filter.channel]
                    }
                ];
            }
            const subscribeMessages = [];
            for (const symbolsBatch of handy_1.batch(filter.symbols, 10)) {
                subscribeMessages.push({
                    op: 'subscribe',
                    args: symbolsBatch.map((s) => `${filter.channel}:${s}`)
                });
            }
            return subscribeMessages;
        })
            .flatMap((s) => s);
    }
    messageIsError(message) {
        if (message.error !== undefined) {
            return true;
        }
        if ('subscribe' in message && message.success === false) {
            return true;
        }
        return false;
    }
}
exports.BitmexRealTimeFeed = BitmexRealTimeFeed;
//# sourceMappingURL=bitmex.js.map