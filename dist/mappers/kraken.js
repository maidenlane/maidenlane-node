"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.krakenBookChangeMapper = exports.krakenTradesMapper = void 0;
// https://www.kraken.com/features/websocket-api
exports.krakenTradesMapper = {
    canHandle(message) {
        if (!Array.isArray(message)) {
            return false;
        }
        const channel = message[message.length - 2];
        return channel === 'trade';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        const [_, trades, __, symbol] = message;
        for (const [price, amount, time, side] of trades) {
            const timeExchange = Number(time);
            const timestamp = new Date(timeExchange * 1000);
            timestamp.μs = Math.floor(timeExchange * 1000000) % 1000;
            yield {
                type: 'trade',
                symbol,
                exchange: 'kraken',
                id: undefined,
                price: Number(price),
                amount: Number(amount),
                side: side === 'b' ? 'buy' : 'sell',
                timestamp,
                localTimestamp
            };
        }
    }
};
const mapBookLevel = (level) => {
    const [price, amount] = level;
    return { price: Number(price), amount: Number(amount) };
};
const getLatestTimestamp = (bids, asks) => {
    const timestampsSorted = [...bids.map((b) => Number(b[2])), ...asks.map((b) => Number(b[2]))].sort();
    const lastBookUpdateTime = timestampsSorted[timestampsSorted.length - 1];
    const timestamp = new Date(lastBookUpdateTime * 1000);
    timestamp.μs = Math.floor(lastBookUpdateTime * 1000000) % 1000;
    return timestamp;
};
exports.krakenBookChangeMapper = {
    canHandle(message) {
        if (!Array.isArray(message)) {
            return false;
        }
        const channel = message[message.length - 2];
        return channel.startsWith('book');
    },
    getFilters(symbols) {
        return [
            {
                channel: 'book',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        if ('as' in message[1]) {
            // we've got snapshot message
            const [_, { as, bs }, __, symbol] = message;
            yield {
                type: 'book_change',
                symbol: symbol,
                exchange: 'kraken',
                isSnapshot: true,
                bids: bs.map(mapBookLevel),
                asks: as.map(mapBookLevel),
                timestamp: getLatestTimestamp(as, bs),
                localTimestamp: localTimestamp
            };
        }
        else {
            // we've got update message
            const symbol = message[message.length - 1];
            const asks = 'a' in message[1] ? message[1].a : [];
            const bids = 'b' in message[1] ? message[1].b : typeof message[2] !== 'string' && 'b' in message[2] ? message[2].b : [];
            yield {
                type: 'book_change',
                symbol,
                exchange: 'kraken',
                isSnapshot: false,
                bids: bids.map(mapBookLevel),
                asks: asks.map(mapBookLevel),
                timestamp: getLatestTimestamp(asks, bids),
                localTimestamp: localTimestamp
            };
        }
    }
};
//# sourceMappingURL=kraken.js.map