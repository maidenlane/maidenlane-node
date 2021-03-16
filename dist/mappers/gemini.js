"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiBookChangeMapper = exports.geminiTradesMapper = void 0;
// https://docs.gemini.com/websocket-api/#market-data-version-2
exports.geminiTradesMapper = {
    canHandle(message) {
        return message.type === 'trade';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(geminiTrade, localTimestamp) {
        yield {
            type: 'trade',
            symbol: geminiTrade.symbol,
            exchange: 'gemini',
            id: String(geminiTrade.event_id),
            price: Number(geminiTrade.price),
            amount: Number(geminiTrade.quantity),
            side: geminiTrade.side,
            timestamp: new Date(geminiTrade.timestamp),
            localTimestamp: localTimestamp
        };
    }
};
const mapBookLevel = (level) => {
    const price = Number(level[1]);
    const amount = Number(level[2]);
    return { price, amount };
};
exports.geminiBookChangeMapper = {
    canHandle(message) {
        return message.type === 'l2_updates';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'l2_updates',
                symbols
            }
        ];
    },
    *map(geminiL2Updates, localTimestamp) {
        yield {
            type: 'book_change',
            symbol: geminiL2Updates.symbol,
            exchange: 'gemini',
            isSnapshot: geminiL2Updates.auction_events !== undefined,
            bids: geminiL2Updates.changes.filter((c) => c[0] === 'buy').map(mapBookLevel),
            asks: geminiL2Updates.changes.filter((c) => c[0] === 'sell').map(mapBookLevel),
            timestamp: localTimestamp,
            localTimestamp
        };
    }
};
//# sourceMappingURL=gemini.js.map