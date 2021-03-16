"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiDMLinearSwapRealTimeFeed = exports.HuobiDMSwapRealTimeFeed = exports.HuobiDMRealTimeFeed = exports.HuobiRealTimeFeed = void 0;
const got_1 = __importDefault(require("got"));
const zlib_1 = require("zlib");
const realtimefeed_1 = require("./realtimefeed");
const handy_1 = require("../handy");
class HuobiRealTimeFeedBase extends realtimefeed_1.MultiConnectionRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this._marketDataChannels = ['depth', 'detail', 'trade', 'bbo'];
        this._notificationsChannels = ['funding_rate', 'liquidation_orders', 'contract_info'];
    }
    *_getRealTimeFeeds(exchange, filters, timeoutIntervalMS, onError) {
        const marketByPriceFilters = filters.filter((f) => f.channel === 'mbp');
        if (marketByPriceFilters.length > 0) {
            // https://huobiapi.github.io/docs/spot/v1/en/#market-by-price-incremental-update
            const marketByPriceWSUrl = this.wssURL.replace('/ws', '/feed');
            yield new HuobiMarketDataRealTimeFeed(exchange, marketByPriceFilters, marketByPriceWSUrl, this.suffixes, timeoutIntervalMS, onError);
        }
        const basisFilters = filters.filter((f) => f.channel === 'basis');
        if (basisFilters.length > 0) {
            const basisWSURL = this.wssURL.replace('/ws', '/ws_index').replace('/swap-ws', '/ws_index');
            yield new HuobiMarketDataRealTimeFeed(exchange, basisFilters, basisWSURL, this.suffixes, timeoutIntervalMS, onError);
        }
        const marketDataFilters = filters.filter((f) => this._marketDataChannels.includes(f.channel));
        if (marketDataFilters.length > 0) {
            yield new HuobiMarketDataRealTimeFeed(exchange, marketDataFilters, this.wssURL, this.suffixes, timeoutIntervalMS, onError);
        }
        const notificationsFilters = filters.filter((f) => this._notificationsChannels.includes(f.channel));
        if (notificationsFilters.length > 0) {
            const notificationsWSURL = this.wssURL.replace('/swap-ws', '/swap-notification').replace('/ws', '/notification');
            yield new HuobiNotificationsRealTimeFeed(exchange, notificationsFilters, notificationsWSURL, timeoutIntervalMS, onError);
        }
        const openInterestFilters = filters.filter((f) => f.channel === 'open_interest');
        if (openInterestFilters.length > 0) {
            const instruments = openInterestFilters.flatMap((s) => s.symbols);
            yield new HuobiOpenInterestClient(exchange, this.httpURL, instruments, this.getURLPath.bind(this));
        }
    }
    getURLPath(symbol) {
        return symbol;
    }
}
class HuobiMarketDataRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(exchange, filters, wssURL, _suffixes, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = wssURL;
        this._suffixes = _suffixes;
        this.decompress = (message) => {
            message = zlib_1.unzipSync(message);
            return message;
        };
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('HuobiRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                const sub = `market.${symbol}.${filter.channel}${this._suffixes[filter.channel] !== undefined ? this._suffixes[filter.channel] : ''}`;
                return {
                    id: '1',
                    sub,
                    data_type: sub.endsWith('.high_freq') ? 'incremental' : undefined
                };
            });
        })
            .flatMap((s) => s);
    }
    async provideManualSnapshots(filters, shouldCancel) {
        const mbpFilter = filters.find((f) => f.channel === 'mbp');
        if (!mbpFilter) {
            return;
        }
        await handy_1.wait(1.5 * handy_1.ONE_SEC_IN_MS);
        for (let symbol of mbpFilter.symbols) {
            if (shouldCancel()) {
                return;
            }
            this.send({
                id: '1',
                req: `market.${symbol}.mbp.150`
            });
            await handy_1.wait(50);
        }
        this.debug('sent mbp.150 "req" for: %s', mbpFilter.symbols);
    }
    messageIsError(message) {
        if (message.status === 'error') {
            return true;
        }
        return false;
    }
    onMessage(message) {
        if (message.ping !== undefined) {
            this.send({
                pong: message.ping
            });
        }
    }
    messageIsHeartbeat(message) {
        return message.ping !== undefined;
    }
}
class HuobiNotificationsRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor(exchange, filters, wssURL, timeoutIntervalMS, onError) {
        super(exchange, filters, timeoutIntervalMS, onError);
        this.wssURL = wssURL;
        this.decompress = (message) => {
            message = zlib_1.unzipSync(message);
            return message;
        };
    }
    mapToSubscribeMessages(filters) {
        return filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('HuobiNotificationsRealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            return filter.symbols.map((symbol) => {
                return {
                    op: 'sub',
                    cid: '1',
                    topic: `public.${symbol}.${filter.channel}`
                };
            });
        })
            .flatMap((s) => s);
    }
    messageIsError(message) {
        if (message.op === 'error' || message.op === 'close') {
            return true;
        }
        const errorCode = message['err-code'];
        if (errorCode !== undefined && errorCode !== 0) {
            return true;
        }
        return false;
    }
    onMessage(message) {
        if (message.op === 'ping') {
            this.send({
                op: 'pong',
                ts: message.ts
            });
        }
    }
    messageIsHeartbeat(message) {
        return message.ping !== undefined;
    }
}
class HuobiOpenInterestClient extends realtimefeed_1.PoolingClientBase {
    constructor(exchange, _httpURL, _instruments, _getURLPath) {
        super(exchange, 4);
        this._httpURL = _httpURL;
        this._instruments = _instruments;
        this._getURLPath = _getURLPath;
    }
    async poolDataToStream(outputStream) {
        for (const instruments of handy_1.batch(this._instruments, 10)) {
            await Promise.all(instruments.map(async (instrument) => {
                if (outputStream.destroyed) {
                    return;
                }
                const url = `${this._httpURL}/${this._getURLPath(instrument)}`;
                const openInterestResponse = (await got_1.default.get(url, { timeout: 2000 }).json());
                if (openInterestResponse.status !== 'ok') {
                    throw new Error(`open interest response error:${JSON.stringify(openInterestResponse)}, url:${url}`);
                }
                const openInterestMessage = {
                    ch: `market.${instrument}.open_interest`,
                    generated: true,
                    data: openInterestResponse.data,
                    ts: openInterestResponse.ts
                };
                if (outputStream.writable) {
                    outputStream.write(openInterestMessage);
                }
            }));
        }
    }
}
class HuobiRealTimeFeed extends HuobiRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api-aws.huobi.pro/ws';
        this.httpURL = 'https://api-aws.huobi.pro/v1';
        this.suffixes = {
            trade: '.detail',
            depth: '.step0',
            mbp: '.150'
        };
    }
}
exports.HuobiRealTimeFeed = HuobiRealTimeFeed;
class HuobiDMRealTimeFeed extends HuobiRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.hbdm.vn/ws';
        this.httpURL = 'https://api.hbdm.vn/api/v1';
        this.suffixes = {
            trade: '.detail',
            depth: '.size_150.high_freq',
            basis: '.1min.close'
        };
        this._contractTypeMap = {
            CW: 'this_week',
            NW: 'next_week',
            CQ: 'quarter',
            NQ: 'next_quarter'
        };
    }
    getURLPath(symbol) {
        const split = symbol.split('_');
        const index = split[0];
        const contractType = this._contractTypeMap[split[1]];
        return `contract_open_interest?symbol=${index}&contract_type=${contractType}`;
    }
}
exports.HuobiDMRealTimeFeed = HuobiDMRealTimeFeed;
class HuobiDMSwapRealTimeFeed extends HuobiRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.hbdm.vn/swap-ws';
        this.httpURL = 'https://api.hbdm.vn/swap-api/v1';
        this.suffixes = {
            trade: '.detail',
            depth: '.size_150.high_freq',
            basis: '.1min.close'
        };
    }
    getURLPath(symbol) {
        return `swap_open_interest?contract_code=${symbol}`;
    }
}
exports.HuobiDMSwapRealTimeFeed = HuobiDMSwapRealTimeFeed;
class HuobiDMLinearSwapRealTimeFeed extends HuobiRealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://api.hbdm.vn/linear-swap-ws';
        this.httpURL = 'https://api.hbdm.vn/linear-swap-api/v1';
        this.suffixes = {
            trade: '.detail',
            depth: '.size_150.high_freq',
            basis: '.1min.close'
        };
    }
    getURLPath(symbol) {
        return `swap_open_interest?contract_code=${symbol}`;
    }
}
exports.HuobiDMLinearSwapRealTimeFeed = HuobiDMLinearSwapRealTimeFeed;
//# sourceMappingURL=huobi.js.map