"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkexOptionsRealTimeFeed = exports.OKCoinRealTimeFeed = exports.OkexRealTimeFeed = void 0;
const zlib_1 = require("zlib");
const realtimefeed_1 = require("./realtimefeed");
class OkexRealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://awspush.okex.com:8443/ws/v3';
        this.decompress = (message) => {
            message = zlib_1.inflateRawSync(message);
            return message;
        };
    }
    mapToSubscribeMessages(filters) {
        const args = filters
            .map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error(`${this._exchange} RealTimeFeed requires explicitly specified symbols when subscribing to live feed`);
            }
            return filter.symbols.map((symbol) => {
                return `${filter.channel}:${symbol}`;
            });
        })
            .flatMap((s) => s);
        return [
            {
                op: 'subscribe',
                args: [...new Set(args)]
            }
        ];
    }
    messageIsError(message) {
        return message.event === 'error';
    }
}
exports.OkexRealTimeFeed = OkexRealTimeFeed;
class OKCoinRealTimeFeed extends OkexRealTimeFeed {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://real.okcoin.com:8443/ws/v3';
    }
}
exports.OKCoinRealTimeFeed = OKCoinRealTimeFeed;
class OkexOptionsRealTimeFeed extends OkexRealTimeFeed {
    constructor() {
        super(...arguments);
        this._defaultIndexes = ['BTC-USD', 'ETH-USD', 'EOS-USD'];
    }
    _channelRequiresIndexNotSymbol(channel) {
        if (channel === 'index/ticker' || channel === 'option/summary') {
            return true;
        }
        return false;
    }
    mapToSubscribeMessages(filters) {
        const args = filters
            .map((filter) => {
            let symbols = filter.symbols || [];
            const channelRequiresIndexNotSymbol = this._channelRequiresIndexNotSymbol(filter.channel);
            if (symbols.length === 0 && channelRequiresIndexNotSymbol) {
                symbols = this._defaultIndexes;
            }
            if (symbols.length === 0) {
                throw new Error(`${this._exchange} RealTimeFeed requires explicitly specified symbols when subscribing to live feed`);
            }
            return symbols.map((symbol) => {
                let finalSymbol = symbol;
                if (channelRequiresIndexNotSymbol) {
                    const symbolParts = symbol.split('-');
                    finalSymbol = `${symbolParts[0]}-${symbolParts[1]}`;
                }
                return `${filter.channel}:${finalSymbol}`;
            });
        })
            .flatMap((s) => s);
        return [
            {
                op: 'subscribe',
                args: [...new Set(args)]
            }
        ];
    }
}
exports.OkexOptionsRealTimeFeed = OkexOptionsRealTimeFeed;
//# sourceMappingURL=okex.js.map