"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class GeminiRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.gemini.com/v2/marketdata';
    }
    mapToSubscribeMessages(filters) {
        const symbols = filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('GeminiRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols;
        })
            .flatMap((s) => s)
            .filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
        return [
            {
                type: 'subscribe',
                subscriptions: [
                    {
                        name: 'l2',
                        symbols
                    }
                ]
            }
        ];
    }
    messageIsError(message) {
        return message.result === 'error';
    }
}
exports.GeminiRealTimeFeed = GeminiRealTimeFeed;
//# sourceMappingURL=gemini.js.map