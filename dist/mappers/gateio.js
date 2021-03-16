"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateIOBookChangeMapper = exports.GateIOTradesMapper = void 0;
// https://www.gate.io/docs/websocket/index.html
class GateIOTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this._seenSymbols = new Set();
    }
    canHandle(message) {
        return message.method === 'trades.update';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    }
    *map(tradesMessage, localTimestamp) {
        const symbol = tradesMessage.params[0];
        // gate io sends trades from newest to oldest for some reason
        for (const gateIOTrade of tradesMessage.params[1].reverse()) {
            // always ignore first returned trade as it's a 'stale' trade, which has already been published before disconnect
            if (this._seenSymbols.has(symbol) === false) {
                this._seenSymbols.add(symbol);
                break;
            }
            const timestamp = new Date(gateIOTrade.time * 1000);
            timestamp.μs = Math.floor(gateIOTrade.time * 1000000) % 1000;
            yield {
                type: 'trade',
                symbol,
                exchange: this._exchange,
                id: gateIOTrade.id.toString(),
                price: Number(gateIOTrade.price),
                amount: Number(gateIOTrade.amount),
                side: gateIOTrade.type == 'sell' ? 'sell' : 'buy',
                timestamp,
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.GateIOTradesMapper = GateIOTradesMapper;
const mapBookLevel = (level) => {
    const price = Number(level[0]);
    const amount = Number(level[1]);
    return { price, amount };
};
class GateIOBookChangeMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        return message.method === 'depth.update';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'depth',
                symbols
            }
        ];
    }
    *map(depthMessage, localTimestamp) {
        const symbol = depthMessage.params[2];
        const isSnapshot = depthMessage.params[0];
        const bids = Array.isArray(depthMessage.params[1].bids) ? depthMessage.params[1].bids : [];
        const asks = Array.isArray(depthMessage.params[1].asks) ? depthMessage.params[1].asks : [];
        yield {
            type: 'book_change',
            symbol,
            exchange: this._exchange,
            isSnapshot,
            bids: bids.map(mapBookLevel),
            asks: asks.map(mapBookLevel),
            timestamp: localTimestamp,
            localTimestamp: localTimestamp
        };
    }
}
exports.GateIOBookChangeMapper = GateIOBookChangeMapper;
//# sourceMappingURL=gateio.js.map