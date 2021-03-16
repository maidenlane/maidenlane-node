"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoloniexBookChangeMapper = exports.PoloniexTradesMapper = void 0;
// https://docs.poloniex.com/#websocket-api
class PoloniexTradesMapper {
    constructor() {
        this._channelIdToSymbolMap = new Map();
    }
    canHandle(message) {
        if (message.length < 3) {
            return false;
        }
        // store mapping between channel id and symbols
        if (message[2][0][0] === 'i') {
            this._channelIdToSymbolMap.set(message[0], message[2][0][1].currencyPair);
        }
        return message[2].some((m) => m[0] === 't');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'price_aggregated_book',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const lastItem = message[message.length - 1];
        const symbol = typeof lastItem === 'string' ? lastItem : this._channelIdToSymbolMap.get(message[0]);
        if (symbol === undefined) {
            return;
        }
        for (const item of message[2]) {
            if (item[0] !== 't') {
                continue;
            }
            const [_, id, side, price, size, timestamp] = item;
            yield {
                type: 'trade',
                symbol,
                exchange: 'poloniex',
                id: String(id),
                price: Number(price),
                amount: Number(size),
                side: side === 1 ? 'buy' : 'sell',
                timestamp: new Date(timestamp * 1000),
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.PoloniexTradesMapper = PoloniexTradesMapper;
const mapSnapshotLevels = (levels) => {
    return Object.keys(levels).map((key) => {
        return {
            price: Number(key),
            amount: Number(levels[key])
        };
    });
};
const mapBookLevel = (level) => {
    return {
        price: Number(level[2]),
        amount: Number(level[3])
    };
};
class PoloniexBookChangeMapper {
    constructor() {
        this._channelIdToSymbolMap = new Map();
    }
    canHandle(message) {
        if (message.length < 3) {
            return false;
        }
        // store mapping between channel id and symbols
        if (message[2][0][0] === 'i') {
            this._channelIdToSymbolMap.set(message[0], message[2][0][1].currencyPair);
        }
        return message[2].some((m) => m[0] === 'i' || m[0] === 'o');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'price_aggregated_book',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const lastItem = message[message.length - 1];
        const symbol = typeof lastItem === 'string' ? lastItem : this._channelIdToSymbolMap.get(message[0]);
        if (symbol === undefined) {
            return;
        }
        let updates = [];
        for (const item of message[2]) {
            if (item[0] === 'i') {
                const bookSnapshot = {
                    type: 'book_change',
                    symbol,
                    exchange: 'poloniex',
                    isSnapshot: true,
                    bids: mapSnapshotLevels(item[1].orderBook[1]),
                    asks: mapSnapshotLevels(item[1].orderBook[0]),
                    timestamp: localTimestamp,
                    localTimestamp: localTimestamp
                };
                yield bookSnapshot;
            }
            else if (item[0] === 'o') {
                updates.push(item);
            }
        }
        if (updates.length > 0) {
            const bookUpdate = {
                type: 'book_change',
                symbol,
                exchange: 'poloniex',
                isSnapshot: false,
                bids: updates.filter((u) => u[1] == 1).map(mapBookLevel),
                asks: updates.filter((u) => u[1] == 0).map(mapBookLevel),
                timestamp: localTimestamp,
                localTimestamp: localTimestamp
            };
            yield bookUpdate;
        }
    }
}
exports.PoloniexBookChangeMapper = PoloniexBookChangeMapper;
//# sourceMappingURL=poloniex.js.map