"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class DeltaRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.delta.exchange:2096';
    }
    mapToSubscribeMessages(filters) {
        return filters.map((filter) => {
            return {
                type: 'subscribe',
                payload: {
                    channels: [
                        {
                            name: filter.channel,
                            symbols: filter.symbols !== undefined && filter.channel === 'mark_price' ? filter.symbols.map((s) => `MARK:${s}`) : filter.symbols
                        }
                    ]
                }
            };
        });
    }
    messageIsError(message) {
        return message.error !== undefined && message.error !== null;
    }
}
exports.DeltaRealTimeFeed = DeltaRealTimeFeed;
//# sourceMappingURL=delta.js.map