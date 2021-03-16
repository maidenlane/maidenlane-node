"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BybitLiquidationsMapper = exports.BybitDerivativeTickerMapper = exports.BybitBookChangeMapper = exports.BybitTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://github.com/bybit-exchange/bybit-official-api-docs/blob/master/en/websocket.md
class BybitTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this._seenSymbols = new Set();
    }
    canHandle(message) {
        if (message.topic === undefined) {
            return false;
        }
        return message.topic.startsWith('trade.');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        for (const trade of message.data) {
            const symbol = trade.symbol;
            const isLinear = symbol.endsWith('USDT');
            // for some reason bybit publishes 'stale' trades for it's linear contracts (trades that already been published before disconnect)
            if (isLinear && this._seenSymbols.has(symbol) === false) {
                this._seenSymbols.add(symbol);
                break;
            }
            const timestamp = trade.trade_time_ms !== undefined ? new Date(Number(trade.trade_time_ms)) : new Date(trade.timestamp);
            yield {
                type: 'trade',
                symbol: trade.symbol,
                exchange: this._exchange,
                id: trade.trade_id,
                price: Number(trade.price),
                amount: trade.size,
                side: trade.side == 'Buy' ? 'buy' : trade.side === 'Sell' ? 'sell' : 'unknown',
                timestamp,
                localTimestamp
            };
        }
    }
}
exports.BybitTradesMapper = BybitTradesMapper;
class BybitBookChangeMapper {
    constructor(_exchange, _canUseBook200Channel) {
        this._exchange = _exchange;
        this._canUseBook200Channel = _canUseBook200Channel;
    }
    canHandle(message) {
        if (message.topic === undefined) {
            return false;
        }
        if (this._canUseBook200Channel) {
            return message.topic.startsWith('orderBook_200.');
        }
        else {
            return message.topic.startsWith('orderBookL2_25.');
        }
    }
    getFilters(symbols) {
        if (this._canUseBook200Channel) {
            return [
                {
                    channel: 'orderBook_200',
                    symbols
                }
            ];
        }
        return [
            {
                channel: 'orderBookL2_25',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const topicArray = message.topic.split('.');
        const symbol = topicArray[topicArray.length - 1];
        const data = message.type === 'snapshot'
            ? 'order_book' in message.data
                ? message.data.order_book
                : message.data
            : [...message.data.delete, ...message.data.update, ...message.data.insert];
        const timestampBybit = Number(message.timestamp_e6);
        const timestamp = new Date(timestampBybit / 1000);
        timestamp.μs = timestampBybit % 1000;
        yield {
            type: 'book_change',
            symbol,
            exchange: this._exchange,
            isSnapshot: message.type === 'snapshot',
            bids: data.filter((d) => d.side === 'Buy').map(this._mapBookLevel),
            asks: data.filter((d) => d.side === 'Sell').map(this._mapBookLevel),
            timestamp,
            localTimestamp
        };
    }
    _mapBookLevel(level) {
        return { price: Number(level.price), amount: level.size !== undefined ? level.size : 0 };
    }
}
exports.BybitBookChangeMapper = BybitBookChangeMapper;
class BybitDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        if (message.topic === undefined) {
            return false;
        }
        return message.topic.startsWith('instrument_info.');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'instrument_info',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const instrumentInfo = 'symbol' in message.data ? message.data : message.data.update[0];
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(instrumentInfo.symbol, 'bybit');
        pendingTickerInfo.updateFundingRate(instrumentInfo.funding_rate_e6 !== undefined ? instrumentInfo.funding_rate_e6 / 1000000 : undefined);
        pendingTickerInfo.updatePredictedFundingRate(instrumentInfo.predicted_funding_rate_e6 !== undefined ? instrumentInfo.predicted_funding_rate_e6 / 1000000 : undefined);
        pendingTickerInfo.updateFundingTimestamp(instrumentInfo.next_funding_time !== undefined ? new Date(instrumentInfo.next_funding_time) : undefined);
        pendingTickerInfo.updateIndexPrice(instrumentInfo.index_price_e4 !== undefined ? instrumentInfo.index_price_e4 / 10000 : undefined);
        pendingTickerInfo.updateMarkPrice(instrumentInfo.mark_price_e4 !== undefined ? instrumentInfo.mark_price_e4 / 10000 : undefined);
        pendingTickerInfo.updateOpenInterest(instrumentInfo.open_interest_e8 !== undefined ? instrumentInfo.open_interest_e8 / 100000000 : instrumentInfo.open_interest);
        pendingTickerInfo.updateLastPrice(instrumentInfo.last_price_e4 !== undefined ? instrumentInfo.last_price_e4 / 10000 : undefined);
        if (instrumentInfo.updated_at) {
            pendingTickerInfo.updateTimestamp(new Date(instrumentInfo.updated_at));
        }
        else {
            const timestampBybit = Number(message.timestamp_e6);
            const timestamp = new Date(timestampBybit / 1000);
            timestamp.μs = timestampBybit % 1000;
            pendingTickerInfo.updateTimestamp(timestamp);
        }
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.BybitDerivativeTickerMapper = BybitDerivativeTickerMapper;
class BybitLiquidationsMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.topic === undefined) {
            return false;
        }
        return message.topic.startsWith('liquidation.');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'liquidation',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        for (const bybitLiquidation of message.data) {
            const liquidation = {
                type: 'liquidation',
                symbol: bybitLiquidation.symbol,
                exchange: this._exchange,
                id: String(bybitLiquidation.id),
                price: Number(bybitLiquidation.price),
                amount: bybitLiquidation.qty,
                side: bybitLiquidation.side == 'Buy' ? 'sell' : 'buy',
                timestamp: new Date(bybitLiquidation.time),
                localTimestamp
            };
            yield liquidation;
        }
    }
}
exports.BybitLiquidationsMapper = BybitLiquidationsMapper;
//# sourceMappingURL=bybit.js.map