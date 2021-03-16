"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateIOFuturesRealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class GateIOFuturesRealTimeFeed extends realtimefeed_1.MultiConnectionRealTimeFeedBase {
    *_getRealTimeFeeds(exchange, filters, timeoutIntervalMS, onError) {
        const linearContractsFilters = filters.reduce(this._only((s) => s.endsWith('_USDT')), []);
        const inverseContractsFilters = filters.reduce(this._only((s) => s.endsWith('_USDT') === false), []);
        if (linearContractsFilters.length > 0) {
            yield new GateIOFuturesSingleConnectionRealTimeFeed('usdt', exchange, linearContractsFilters, timeoutIntervalMS, onError);
        }
        if (inverseContractsFilters.length > 0) {
            yield new GateIOFuturesSingleConnectionRealTimeFeed('btc', exchange, inverseContractsFilters, timeoutIntervalMS, onError);
        }
    }
    _only(filter) {
        return (prev, current) => {
            if (!current.symbols || current.symbols.length === 0) {
                throw new Error('GateIOFuturesRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            const symbols = current.symbols.filter(filter);
            if (symbols.length > 0) {
                prev.push({
                    channel: current.channel,
                    symbols
                });
            }
            return prev;
        };
    }
}
exports.GateIOFuturesRealTimeFeed = GateIOFuturesRealTimeFeed;
class GateIOFuturesSingleConnectionRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(wsURLSuffix, exchange, filters, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = `wss://fx-ws.gateio.ws/v4/ws/${wsURLSuffix}`;
    }
    mapToSubscribeMessages(filters) {
        const payload = filters.flatMap((filter) => {
            if (filter.channel === 'order_book') {
                return filter.symbols.map((symbol) => {
                    return {
                        event: 'subscribe',
                        channel: `futures.${filter.channel}`,
                        payload: [symbol, '20', '0'],
                        time: Math.floor(new Date().valueOf() / 1000)
                    };
                });
            }
            else {
                return [
                    {
                        event: 'subscribe',
                        channel: `futures.${filter.channel}`,
                        payload: filter.symbols,
                        time: Math.floor(new Date().valueOf() / 1000)
                    }
                ];
            }
        });
        return payload;
    }
    messageIsError(message) {
        if (message.error !== null && message.error !== undefined) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=gateiofutures.js.map