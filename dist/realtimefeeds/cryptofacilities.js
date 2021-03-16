"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptofacilitiesRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class CryptofacilitiesRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://www.cryptofacilities.com/ws/v1';
    }
    mapToSubscribeMessages(filters) {
        return filters
            .filter((filter) => filter.channel.endsWith('_snapshot') === false)
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('CryptofacilitiesRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return {
                event: 'subscribe',
                product_ids: filter.symbols,
                feed: filter.channel
            };
        });
    }
    messageIsError(message) {
        return message.event === 'error';
    }
    messageIsHeartbeat(message) {
        return message.feed === 'heartbeat';
    }
}
exports.CryptofacilitiesRealTimeFeed = CryptofacilitiesRealTimeFeed;
//# sourceMappingURL=cryptofacilities.js.map