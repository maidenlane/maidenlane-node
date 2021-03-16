"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinflexRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class CoinflexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://v2api.coinflex.com/v2/websocket';
    }
    mapToSubscribeMessages(filters) {
        const args = filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('CoinflexRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((s) => `${filter.channel}:${s}`);
        })
            .flatMap((s) => s);
        const payload = {
            op: 'subscribe',
            args
        };
        return [payload];
    }
    messageIsError(message) {
        return message.success === false;
    }
}
exports.CoinflexRealTimeFeed = CoinflexRealTimeFeed;
//# sourceMappingURL=coinflex.js.map