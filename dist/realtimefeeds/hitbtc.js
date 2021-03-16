"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HitBtcRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class HitBtcRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.hitbtc.com/api/2/ws';
        this.channelMappings = {
            subscribeOrderbook: ['snapshotOrderbook', 'updateOrderbook'],
            subscribeTrades: ['updateTrades', 'snapshotTrades']
        };
    }
    mapToSubscribeMessages(filters) {
        const subscriptions = filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('HitBtcRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            const subscribeToOrderBook = this.channelMappings.subscribeOrderbook.includes(filter.channel);
            const subscribeToTrades = this.channelMappings.subscribeTrades.includes(filter.channel);
            let method;
            if (subscribeToOrderBook) {
                method = 'subscribeOrderbook';
            }
            else if (subscribeToTrades) {
                method = 'subscribeTrades';
            }
            else {
                throw new Error(`Invalid channel: ${filter.channel}`);
            }
            return filter.symbols.map((symbol) => {
                return {
                    method,
                    symbol
                };
            });
        })
            .flatMap((s) => s)
            .reduce((prev, current) => {
            const matchingExisting = prev.find((c) => c.method === current.method && c.symbol === current.symbol);
            if (matchingExisting === undefined) {
                prev.push(current);
            }
            return prev;
        }, []);
        return subscriptions.map((subscription, index) => {
            return {
                method: subscription.method,
                params: {
                    symbol: subscription.symbol
                },
                id: index + 1
            };
        });
    }
    messageIsError(message) {
        return message.error !== undefined;
    }
}
exports.HitBtcRealTimeFeed = HitBtcRealTimeFeed;
//# sourceMappingURL=hitbtc.js.map