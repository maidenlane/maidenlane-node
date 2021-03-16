"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binanceDexBookChangeMapper = exports.binanceDexTradesMapper = void 0;
// https://docs.binance.org/api-reference/dex-api/ws-streams.html
exports.binanceDexTradesMapper = {
    canHandle(message) {
        return message.stream === 'trades';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    },
    *map(binanceDexTradeResponse, localTimestamp) {
        for (const binanceDexTrade of binanceDexTradeResponse.data) {
            yield {
                type: 'trade',
                symbol: binanceDexTrade.s,
                exchange: 'binance-dex',
                id: binanceDexTrade.t,
                price: Number(binanceDexTrade.p),
                amount: Number(binanceDexTrade.q),
                side: binanceDexTrade.tt === 2 ? 'sell' : 'buy',
                timestamp: new Date(Math.floor(binanceDexTrade.T / 1000000)),
                localTimestamp: localTimestamp
            };
        }
    }
};
const mapBookLevel = (level) => {
    const price = Number(level[0]);
    const amount = Number(level[1]);
    return { price, amount };
};
exports.binanceDexBookChangeMapper = {
    canHandle(message) {
        return message.stream === 'marketDiff' || message.stream === 'depthSnapshot';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'depthSnapshot',
                symbols
            },
            {
                channel: 'marketDiff',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        if ('symbol' in message.data) {
            // we've got snapshot message
            yield {
                type: 'book_change',
                symbol: message.data.symbol,
                exchange: 'binance-dex',
                isSnapshot: true,
                bids: message.data.bids.map(mapBookLevel),
                asks: message.data.asks.map(mapBookLevel),
                timestamp: localTimestamp,
                localTimestamp
            };
        }
        else {
            // we've got update
            yield {
                type: 'book_change',
                symbol: message.data.s,
                exchange: 'binance-dex',
                isSnapshot: false,
                bids: message.data.b.map(mapBookLevel),
                asks: message.data.a.map(mapBookLevel),
                timestamp: localTimestamp,
                localTimestamp
            };
        }
    }
};
//# sourceMappingURL=binancedex.js.map