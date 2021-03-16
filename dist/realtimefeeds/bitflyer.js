"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitflyerRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class BitflyerRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ws.lightstream.bitflyer.com/json-rpc';
        this.onMessage = (msg) => {
            // once we've received book snapshot, let's unsubscribe from it
            if (msg.params.channel.startsWith('lightning_board_snapshot')) {
                this.send({
                    method: 'unsubscribe',
                    params: {
                        channel: msg.params.channel
                    }
                });
            }
        };
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('BitflyerRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                return {
                    method: 'subscribe',
                    params: {
                        channel: `${filter.channel}_${symbol}`
                    }
                };
            });
        })
            .flatMap((c) => c);
    }
    messageIsError(message) {
        return message.method !== 'channelMessage';
    }
}
exports.BitflyerRealTimeFeed = BitflyerRealTimeFeed;
//# sourceMappingURL=bitflyer.js.map