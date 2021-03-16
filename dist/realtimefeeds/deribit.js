"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeribitRealTimeDataFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class DeribitRealTimeDataFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://www.deribit.com/ws/api/v2';
        this.channelsWithIntervals = ['book', 'perpetual', 'trades', 'ticker'];
    }
    mapToSubscribeMessages(filters) {
        const channels = filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('DeribitRealTimeDataFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                const suffix = this.channelsWithIntervals.includes(filter.channel) ? '.raw' : '';
                return `${filter.channel}.${symbol}${suffix}`;
            });
        })
            .flatMap((f) => f);
        return [
            {
                jsonrpc: '2.0',
                id: 1,
                method: 'public/subscribe',
                params: {
                    channels
                }
            }
        ];
    }
    messageIsError(message) {
        return message.error !== undefined;
    }
    onConnected() {
        // set heartbeat so deribit won't close connection prematurely
        // https://docs.deribit.com/v2/#public-set_heartbeat
        this.send({
            jsonrpc: '2.0',
            method: 'public/set_heartbeat',
            id: 0,
            params: {
                interval: 10
            }
        });
    }
    messageIsHeartbeat(msg) {
        return msg.method === 'heartbeat';
    }
    onMessage(msg) {
        // respond with public/test message to keep connection alive
        if (msg.params !== undefined && msg.params.type === 'test_request') {
            this.send({
                jsonrpc: '2.0',
                method: 'public/test',
                id: 0,
                params: {}
            });
        }
    }
}
exports.DeribitRealTimeDataFeed = DeribitRealTimeDataFeed;
//# sourceMappingURL=deribit.js.map