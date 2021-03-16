"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaDerivativeTickerMapper = exports.deltaBookChangeMapper = exports.DeltaTradesMapper = void 0;
const mapper_1 = require("./mapper");
const fromMicroSecondsToDate = (micros) => {
    const timestamp = new Date(micros / 1000);
    timestamp.μs = micros % 1000;
    return timestamp;
};
class DeltaTradesMapper {
    constructor(_useV2Channels) {
        this._useV2Channels = _useV2Channels;
    }
    canHandle(message) {
        return message.type === (this._useV2Channels ? 'all_trades' : 'recent_trade');
    }
    getFilters(symbols) {
        return [
            {
                channel: this._useV2Channels ? 'all_trades' : 'recent_trade',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        yield {
            type: 'trade',
            symbol: message.symbol,
            exchange: 'delta',
            id: undefined,
            price: Number(message.price),
            amount: message.size,
            side: message.buyer_role === 'taker' ? 'buy' : 'sell',
            timestamp: fromMicroSecondsToDate(message.timestamp),
            localTimestamp: localTimestamp
        };
    }
}
exports.DeltaTradesMapper = DeltaTradesMapper;
const mapBookLevel = (level) => {
    return {
        price: Number(level.limit_price),
        amount: level.size
    };
};
exports.deltaBookChangeMapper = {
    canHandle(message) {
        return message.type === 'l2_orderbook';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'l2_orderbook',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        yield {
            type: 'book_change',
            symbol: message.symbol,
            exchange: 'delta',
            isSnapshot: true,
            bids: message.buy.map(mapBookLevel),
            asks: message.sell.map(mapBookLevel),
            timestamp: message.timestamp !== undefined ? fromMicroSecondsToDate(message.timestamp) : localTimestamp,
            localTimestamp
        };
    }
};
class DeltaDerivativeTickerMapper {
    constructor(_useV2Channels) {
        this._useV2Channels = _useV2Channels;
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return (message.type === (this._useV2Channels ? 'all_trades' : 'recent_trade') ||
            message.type === 'funding_rate' ||
            message.type === 'mark_price');
    }
    getFilters(symbols) {
        return [
            {
                channel: this._useV2Channels ? 'all_trades' : 'recent_trade',
                symbols
            },
            {
                channel: 'funding_rate',
                symbols
            },
            {
                channel: 'mark_price',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(message.symbol.replace('MARK:', ''), 'delta');
        if (message.type === 'recent_trade' || message.type === 'all_trades') {
            pendingTickerInfo.updateLastPrice(Number(message.price));
        }
        if (message.type === 'mark_price') {
            pendingTickerInfo.updateMarkPrice(Number(message.price));
        }
        if (message.type === 'funding_rate') {
            if (message.funding_rate !== undefined) {
                pendingTickerInfo.updateFundingRate(Number(message.funding_rate));
            }
            if (message.predicted_funding_rate !== undefined) {
                pendingTickerInfo.updatePredictedFundingRate(Number(message.predicted_funding_rate));
            }
            if (message.next_funding_realization !== undefined) {
                pendingTickerInfo.updateFundingTimestamp(fromMicroSecondsToDate(message.next_funding_realization));
            }
        }
        pendingTickerInfo.updateTimestamp(fromMicroSecondsToDate(message.timestamp));
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.DeltaDerivativeTickerMapper = DeltaDerivativeTickerMapper;
//# sourceMappingURL=delta.js.map