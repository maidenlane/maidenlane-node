"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtxUSRealTimeFeed = exports.FtxRealTimeFeed = void 0;
const got_1 = __importDefault(require("got"));
const realtimefeed_1 = require("./realtimefeed");
const handy_1 = require("../handy");
class FTXRealTimeFeedBase extends realtimefeed_1.MultiConnectionRealTimeFeedBase {
    *_getRealTimeFeeds(exchange, filters, timeoutIntervalMS, onError) {
        const wsFilters = filters.filter((f) => f.channel !== 'instrument');
        if (wsFilters.length > 0) {
            yield new FtxSingleConnectionRealTimeFeed(exchange, wsFilters, this.wssURL, timeoutIntervalMS, onError);
        }
        const instrumentInfoFilters = filters.filter((f) => f.channel === 'instrument');
        if (instrumentInfoFilters.length > 0) {
            const instruments = instrumentInfoFilters.flatMap((s) => s.symbols);
            yield new FTXInstrumentInfoClient(exchange, this.httpURL, instruments);
        }
    }
}
class FtxSingleConnectionRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(exchange, filters, wssURL, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = wssURL;
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('FtxRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                return {
                    op: 'subscribe',
                    channel: filter.channel,
                    market: symbol
                };
            });
        })
            .flatMap((c) => c);
    }
    messageIsError(message) {
        return message.type === 'error';
    }
}
class FTXInstrumentInfoClient extends realtimefeed_1.PoolingClientBase {
    constructor(exchange, _httpURL, _instruments) {
        super(exchange, 3);
        this._httpURL = _httpURL;
        this._instruments = _instruments;
    }
    async poolDataToStream(outputStream) {
        for (const instruments of handy_1.batch(this._instruments, 10)) {
            await Promise.all(instruments.map(async (instrument) => {
                if (outputStream.destroyed) {
                    return;
                }
                const responses = await Promise.all([
                    got_1.default.get(`${this._httpURL}/futures/${instrument}/stats`, { timeout: 2000 }).json(),
                    got_1.default.get(`${this._httpURL}/futures/${instrument}`, { timeout: 2000 }).json()
                ]);
                if (responses.some((r) => r.success === false)) {
                    return;
                }
                const instrumentMessage = {
                    channel: 'instrument',
                    generated: true,
                    market: instrument,
                    type: 'update',
                    data: {
                        stats: responses[0].result,
                        info: responses[1].result
                    }
                };
                if (outputStream.writable) {
                    outputStream.write(instrumentMessage);
                }
            }));
        }
    }
}
class FtxRealTimeFeed extends FTXRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ws.ftx.com/ws';
        this.httpURL = 'https://ftx.com/api';
    }
}
exports.FtxRealTimeFeed = FtxRealTimeFeed;
class FtxUSRealTimeFeed extends FTXRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ftx.us/ws/';
        this.httpURL = 'https://ftx.us/api';
    }
}
exports.FtxUSRealTimeFeed = FtxUSRealTimeFeed;
//# sourceMappingURL=ftx.js.map