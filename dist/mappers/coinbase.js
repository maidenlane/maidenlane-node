"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinbaseBookChangMapper = exports.coinbaseTradesMapper = void 0;
const handy_1 = require("../handy");
// https://docs.pro.coinbase.com/#websocket-feed
exports.coinbaseTradesMapper = {
    canHandle(message) {
        return message.type === 'match';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'match',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        const timestamp = new Date(message.time);
        timestamp.μs = handy_1.parseμs(message.time);
        yield {
            type: 'trade',
            symbol: message.product_id,
            exchange: 'coinbase',
            id: String(message.trade_id),
            price: Number(message.price),
            amount: Number(message.size),
            side: message.side === 'sell' ? 'buy' : 'sell',
            timestamp,
            localTimestamp: localTimestamp
        };
    }
};
const mapUpdateBookLevel = (level) => {
    const price = Number(level[1]);
    const amount = Number(level[2]);
    return { price, amount };
};
const mapSnapshotBookLevel = (level) => {
    const price = Number(level[0]);
    const amount = Number(level[1]);
    return { price, amount };
};
class CoinbaseBookChangMapper {
    constructor() {
        this._symbolLastTimestampMap = new Map();
    }
    canHandle(message) {
        return message.type === 'l2update' || message.type === 'snapshot';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'snapshot',
                symbols
            },
            {
                channel: 'l2update',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        if (message.type === 'snapshot') {
            yield {
                type: 'book_change',
                symbol: message.product_id,
                exchange: 'coinbase',
                isSnapshot: true,
                bids: message.bids.map(mapSnapshotBookLevel),
                asks: message.asks.map(mapSnapshotBookLevel),
                timestamp: localTimestamp,
                localTimestamp
            };
        }
        else {
            // in very rare cases, Coinbase was returning timestamps that aren't valid, like: "time":"0001-01-01T00:00:00.000000Z"
            // but l2update message was still valid and we need to process it, in such case use timestamp of previous message
            let timestamp = new Date(message.time);
            if (timestamp.valueOf() < 0) {
                let previousValidTimestamp = this._symbolLastTimestampMap.get(message.product_id);
                if (previousValidTimestamp === undefined) {
                    return;
                }
                timestamp = previousValidTimestamp;
            }
            else {
                timestamp.μs = handy_1.parseμs(message.time);
                this._symbolLastTimestampMap.set(message.product_id, timestamp);
            }
            yield {
                type: 'book_change',
                symbol: message.product_id,
                exchange: 'coinbase',
                isSnapshot: false,
                bids: message.changes.filter((c) => c[0] === 'buy').map(mapUpdateBookLevel),
                asks: message.changes.filter((c) => c[0] === 'sell').map(mapUpdateBookLevel),
                timestamp,
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.CoinbaseBookChangMapper = CoinbaseBookChangMapper;
//# sourceMappingURL=coinbase.js.map