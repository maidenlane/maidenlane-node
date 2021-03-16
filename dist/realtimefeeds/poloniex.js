"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoloniexRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class PoloniexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api2.poloniex.com';
    }
    mapToSubscribeMessages(filters) {
        const allSymbols = filters.flatMap((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('PoloniexRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols;
        });
        const uniqueSymbols = [...new Set(allSymbols)];
        return uniqueSymbols.map((symbol) => {
            return {
                command: 'subscribe',
                channel: symbol
            };
        });
    }
    messageIsError(message) {
        return message.error !== undefined && message.error !== null;
    }
}
exports.PoloniexRealTimeFeed = PoloniexRealTimeFeed;
//# sourceMappingURL=poloniex.js.map