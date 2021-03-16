"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BybitRealTimeDataFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class BybitRealTimeDataFeed extends realtimefeed_1.MultiConnectionRealTimeFeedBase {
    *_getRealTimeFeeds(exchange, filters, timeoutIntervalMS, onError) {
        const linearContractsFilters = filters.reduce(this._only((s) => s.endsWith('USDT')), []);
        const inverseContractsFilters = filters.reduce(this._only((s) => s.endsWith('USDT') === false), []);
        if (linearContractsFilters.length > 0) {
            yield new BybitSingleConnectionRealTimeDataFeed('realtime_public', exchange, linearContractsFilters, timeoutIntervalMS, onError);
        }
        if (inverseContractsFilters.length > 0) {
            yield new BybitSingleConnectionRealTimeDataFeed('realtime', exchange, inverseContractsFilters, timeoutIntervalMS, onError);
        }
    }
    _only(filter) {
        return (prev, current) => {
            if (!current.symbols || current.symbols.length === 0) {
                throw new Error('BybitRealTimeDataFeed requires explicitly specified symbols when subscribing to live feed');
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
exports.BybitRealTimeDataFeed = BybitRealTimeDataFeed;
class BybitSingleConnectionRealTimeDataFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(wsURLSuffix, exchange, filters, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = `wss://stream.bybit.com/${wsURLSuffix}`;
    }
    mapToSubscribeMessages(filters) {
        const args = filters
            .map((filter) => {
            return filter.symbols.map((symbol) => {
                const suffix = filter.channel === 'instrument_info' || filter.channel === 'orderBook_200' ? '.100ms' : '';
                return `${filter.channel}${suffix}.${symbol}`;
            });
        })
            .flatMap((f) => f);
        return [
            {
                op: 'subscribe',
                args
            }
        ];
    }
    messageIsError(message) {
        return message.success === false;
    }
}
//# sourceMappingURL=bybit.js.map