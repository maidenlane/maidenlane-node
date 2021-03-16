"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhemexRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class PhemexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://phemex.com/ws';
        this.throttleSubscribeMS = 100;
        this.channelsMap = {
            book: 'orderbook.subscribe',
            trades: 'trade.subscribe',
            market24h: 'market24h.subscribe',
            spot_market24h: 'spot_market24h.subscribe'
        };
    }
    mapToSubscribeMessages(filters) {
        let id = 0;
        return filters
            .map((filter) => {
            if (filter.symbols !== undefined && filter.channel !== 'market24h' && filter.channel !== 'spot_market24h') {
                return filter.symbols.map((symbol) => {
                    return {
                        id: id++,
                        method: this.channelsMap[filter.channel],
                        params: [symbol]
                    };
                });
            }
            else {
                return [
                    {
                        id: id++,
                        method: this.channelsMap[filter.channel],
                        params: []
                    }
                ];
            }
        })
            .flatMap((f) => f);
    }
    messageIsError(message) {
        return message.error !== undefined && message.error !== null;
    }
}
exports.PhemexRealTimeFeed = PhemexRealTimeFeed;
//# sourceMappingURL=phemex.js.map