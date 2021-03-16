"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hitBtcBookChangeMapper = exports.hitBtcTradesMapper = void 0;
// https://api.hitbtc.com/#socket-market-data
exports.hitBtcTradesMapper = {
    canHandle(message) {
        return message.method !== undefined && message.method === 'updateTrades';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'updateTrades',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        for (const trade of message.params.data)
            yield {
                type: 'trade',
                symbol: message.params.symbol,
                exchange: 'hitbtc',
                id: String(trade.id),
                price: Number(trade.price),
                amount: Number(trade.quantity),
                side: trade.side,
                timestamp: new Date(trade.timestamp),
                localTimestamp: localTimestamp
            };
    }
};
const mapBookLevel = (level) => {
    const price = Number(level.price);
    const amount = Number(level.size);
    return { price, amount };
};
exports.hitBtcBookChangeMapper = {
    canHandle(message) {
        if (message.method === undefined) {
            return false;
        }
        return message.method === 'snapshotOrderbook' || message.method === 'updateOrderbook';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'snapshotOrderbook',
                symbols
            },
            {
                channel: 'updateOrderbook',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        yield {
            type: 'book_change',
            symbol: message.params.symbol,
            exchange: 'hitbtc',
            isSnapshot: message.method === 'snapshotOrderbook',
            bids: message.params.bid.map(mapBookLevel),
            asks: message.params.ask.map(mapBookLevel),
            timestamp: new Date(message.params.timestamp),
            localTimestamp
        };
    }
};
//# sourceMappingURL=hitbtc.js.map