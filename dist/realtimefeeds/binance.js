"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceDeliveryRealTimeFeed = exports.BinanceFuturesRealTimeFeed = exports.BinanceUSRealTimeFeed = exports.BinanceJerseyRealTimeFeed = exports.BinanceRealTimeFeed = void 0;
const got_1 = __importDefault(require("got"));
const handy_1 = require("../handy");
const realtimefeed_1 = require("./realtimefeed");
class BinanceRealTimeFeedBase extends realtimefeed_1.MultiConnectionRealTimeFeedBase {
    *_getRealTimeFeeds(exchange, filters, timeoutIntervalMS, onError) {
        const wsFilters = filters.filter((f) => f.channel !== 'openInterest' && f.channel !== 'recentTrades');
        if (wsFilters.length > 0) {
            yield new BinanceSingleConnectionRealTimeFeed(exchange, wsFilters, this.wssURL, this.httpURL, this.suffixes, timeoutIntervalMS, onError);
        }
        const openInterestFilters = filters.filter((f) => f.channel === 'openInterest');
        if (openInterestFilters.length > 0) {
            const instruments = openInterestFilters.flatMap((s) => s.symbols);
            yield new BinanceFuturesOpenInterestClient(exchange, this.httpURL, instruments);
        }
    }
}
class BinanceFuturesOpenInterestClient extends realtimefeed_1.PoolingClientBase {
    constructor(exchange, _httpURL, _instruments) {
        super(exchange, 30);
        this._httpURL = _httpURL;
        this._instruments = _instruments;
    }
    async poolDataToStream(outputStream) {
        for (const instruments of handy_1.batch(this._instruments, 10)) {
            await Promise.all(instruments.map(async (instrument) => {
                if (outputStream.destroyed) {
                    return;
                }
                const openInterestResponse = (await got_1.default
                    .get(`${this._httpURL}/openInterest?symbol=${instrument.toUpperCase()}`, { timeout: 2000 })
                    .json());
                const openInterestMessage = {
                    stream: `${instrument.toLocaleLowerCase()}@openInterest`,
                    generated: true,
                    data: openInterestResponse
                };
                if (outputStream.writable) {
                    outputStream.write(openInterestMessage);
                }
            }));
        }
    }
}
class BinanceSingleConnectionRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(exchange, filters, wssURL, _httpURL, _suffixes, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = wssURL;
        this._httpURL = _httpURL;
        this._suffixes = _suffixes;
    }
    mapToSubscribeMessages(filters) {
        const payload = filters
            .filter((f) => f.channel !== 'depthSnapshot')
            .map((filter, index) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('BinanceRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            const suffix = this._suffixes[filter.channel];
            const channel = suffix !== undefined ? `${filter.channel}@${suffix}` : filter.channel;
            return {
                method: 'SUBSCRIBE',
                params: filter.symbols.map((symbol) => `${symbol}@${channel}`),
                id: index + 1
            };
        });
        return payload;
    }
    messageIsError(message) {
        // subscription confirmation message
        if (message.result === null) {
            return false;
        }
        if (message.stream === undefined) {
            return true;
        }
        if (message.error !== undefined) {
            return true;
        }
        return false;
    }
    async provideManualSnapshots(filters, shouldCancel) {
        const depthSnapshotFilter = filters.find((f) => f.channel === 'depthSnapshot');
        if (!depthSnapshotFilter) {
            return;
        }
        this.debug('requesting manual snapshots for: %s', depthSnapshotFilter.symbols);
        for (let symbol of depthSnapshotFilter.symbols) {
            if (shouldCancel()) {
                return;
            }
            const depthSnapshotResponse = (await got_1.default
                .get(`${this._httpURL}/depth?symbol=${symbol.toUpperCase()}&limit=1000`, { timeout: 2000 })
                .json());
            const snapshot = {
                stream: `${symbol}@depthSnapshot`,
                generated: true,
                data: depthSnapshotResponse
            };
            this.manualSnapshotsBuffer.push(snapshot);
        }
        this.debug('requested manual snapshots successfully for: %s ', depthSnapshotFilter.symbols);
    }
}
class BinanceRealTimeFeed extends BinanceRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://stream.binance.com:9443/stream';
        this.httpURL = 'https://api.binance.com/api/v1';
        this.suffixes = {
            depth: '100ms'
        };
    }
}
exports.BinanceRealTimeFeed = BinanceRealTimeFeed;
class BinanceJerseyRealTimeFeed extends BinanceRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://stream.binance.je:9443/stream';
        this.httpURL = 'https://api.binance.je/api/v1';
        this.suffixes = {
            depth: '100ms'
        };
    }
}
exports.BinanceJerseyRealTimeFeed = BinanceJerseyRealTimeFeed;
class BinanceUSRealTimeFeed extends BinanceRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://stream.binance.us:9443/stream';
        this.httpURL = 'https://api.binance.us/api/v1';
        this.suffixes = {
            depth: '100ms'
        };
    }
}
exports.BinanceUSRealTimeFeed = BinanceUSRealTimeFeed;
class BinanceFuturesRealTimeFeed extends BinanceRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://fstream3.binance.com/stream';
        this.httpURL = 'https://fapi.binance.com/fapi/v1';
        this.suffixes = {
            depth: '0ms',
            markPrice: '1s'
        };
    }
}
exports.BinanceFuturesRealTimeFeed = BinanceFuturesRealTimeFeed;
class BinanceDeliveryRealTimeFeed extends BinanceRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://dstream.binance.com/stream';
        this.httpURL = 'https://dapi.binance.com/dapi/v1';
        this.suffixes = {
            depth: '0ms',
            markPrice: '1s',
            indexPrice: '1s'
        };
    }
}
exports.BinanceDeliveryRealTimeFeed = BinanceDeliveryRealTimeFeed;
//# sourceMappingURL=binance.js.map