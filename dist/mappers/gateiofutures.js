"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateIOFuturesDerivativeTickerMapper = exports.GateIOFuturesBookChangeMapper = exports.GateIOFuturesTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://www.gate.io/docs/futures/ws/index.html
class GateIOFuturesTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        return message.channel === 'futures.trades' && message.event === 'update';
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
        for (const trade of tradesMessage.result) {
            const timestamp = new Date(trade.create_time * 1000);
            yield {
                type: 'trade',
                symbol: trade.contract,
                exchange: this._exchange,
                id: trade.id.toString(),
                price: Number(trade.price),
                amount: Math.abs(trade.size),
                side: trade.size < 0 ? 'sell' : 'buy',
                timestamp,
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.GateIOFuturesTradesMapper = GateIOFuturesTradesMapper;
const mapBookLevel = (level) => {
    const price = Number(level.p);
    return { price, amount: Math.abs(level.s) };
};
class GateIOFuturesBookChangeMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        return message.channel === 'futures.order_book' && (message.event === 'all' || message.event === 'update');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'order_book',
                symbols
            }
        ];
    }
    *map(depthMessage, localTimestamp) {
        if (depthMessage.event === 'all') {
            // snapshot
            yield {
                type: 'book_change',
                symbol: depthMessage.result.contract,
                exchange: this._exchange,
                isSnapshot: true,
                bids: depthMessage.result.bids.map(mapBookLevel),
                asks: depthMessage.result.asks.map(mapBookLevel),
                timestamp: new Date(depthMessage.time * 1000),
                localTimestamp: localTimestamp
            };
        }
        else if (depthMessage.result.length > 0) {
            // update
            yield {
                type: 'book_change',
                symbol: depthMessage.result[0].c,
                exchange: this._exchange,
                isSnapshot: false,
                bids: depthMessage.result.filter((l) => l.s >= 0).map(mapBookLevel),
                asks: depthMessage.result.filter((l) => l.s <= 0).map(mapBookLevel),
                timestamp: new Date(depthMessage.time * 1000),
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.GateIOFuturesBookChangeMapper = GateIOFuturesBookChangeMapper;
class GateIOFuturesDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return message.channel === 'futures.tickers' && message.event === 'update';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'tickers',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        for (const futuresTicker of message.result) {
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(futuresTicker.contract, 'gate-io-futures');
            pendingTickerInfo.updateFundingRate(Number(futuresTicker.funding_rate));
            pendingTickerInfo.updatePredictedFundingRate(Number(futuresTicker.funding_rate_indicative));
            pendingTickerInfo.updateIndexPrice(Number(futuresTicker.index_price));
            pendingTickerInfo.updateMarkPrice(Number(futuresTicker.mark_price));
            pendingTickerInfo.updateLastPrice(Number(futuresTicker.last));
            pendingTickerInfo.updateTimestamp(new Date(message.time * 1000));
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
    }
}
exports.GateIOFuturesDerivativeTickerMapper = GateIOFuturesDerivativeTickerMapper;
//# sourceMappingURL=gateiofutures.js.map