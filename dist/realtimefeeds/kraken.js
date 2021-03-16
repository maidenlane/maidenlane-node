"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KrakenRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class KrakenRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ws.kraken.com';
    }
    mapToSubscribeMessages(filters) {
        return filters.map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('KrakenRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            let depth = undefined;
            if (filter.channel === 'book') {
                depth = 1000;
            }
            return {
                event: 'subscribe',
                pair: filter.symbols,
                subscription: {
                    name: filter.channel,
                    depth
                }
            };
        });
    }
    messageIsError(message) {
        return message.errorMessage !== undefined;
    }
    messageIsHeartbeat(message) {
        return message.event === 'heartbeat';
    }
}
exports.KrakenRealTimeFeed = KrakenRealTimeFeed;
//# sourceMappingURL=kraken.js.map