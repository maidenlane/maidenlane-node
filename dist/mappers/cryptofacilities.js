"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptofacilitiesLiquidationsMapper = exports.CryptofacilitiesDerivativeTickerMapper = exports.cryptofacilitiesBookChangeMapper = exports.cryptofacilitiesTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://www.cryptofacilities.com/resources/hc/en-us/categories/115000132213-API
exports.cryptofacilitiesTradesMapper = {
    canHandle(message) {
        return message.feed === 'trade' && message.event === undefined;
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(trade, localTimestamp) {
        yield {
            type: 'trade',
            symbol: trade.product_id,
            exchange: 'cryptofacilities',
            id: trade.uid,
            price: trade.price,
            amount: trade.qty,
            side: trade.side,
            timestamp: new Date(trade.time),
            localTimestamp: localTimestamp
        };
    }
};
const mapBookLevel = ({ price, qty }) => {
    return { price, amount: qty < 0 ? 0 : qty };
};
exports.cryptofacilitiesBookChangeMapper = {
    canHandle(message) {
        return message.event === undefined && (message.feed === 'book' || message.feed === 'book_snapshot');
    },
    getFilters(symbols) {
        return [
            {
                channel: 'book',
                symbols
            },
            {
                channel: 'book_snapshot',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        if (message.feed === 'book_snapshot') {
            yield {
                type: 'book_change',
                symbol: message.product_id,
                exchange: 'cryptofacilities',
                isSnapshot: true,
                bids: message.bids.map(mapBookLevel),
                asks: message.asks.map(mapBookLevel),
                timestamp: message.timestamp !== undefined ? new Date(message.timestamp) : localTimestamp,
                localTimestamp: localTimestamp
            };
        }
        else {
            const isAsk = message.side === 'sell';
            const update = [
                {
                    price: message.price,
                    amount: message.qty < 0 ? 0 : message.qty
                }
            ];
            yield {
                type: 'book_change',
                symbol: message.product_id,
                exchange: 'cryptofacilities',
                isSnapshot: false,
                bids: isAsk ? [] : update,
                asks: isAsk ? update : [],
                timestamp: message.timestamp !== undefined ? new Date(message.timestamp) : localTimestamp,
                localTimestamp: localTimestamp
            };
        }
    }
};
class CryptofacilitiesDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return message.feed === 'ticker' && message.event === undefined;
    }
    getFilters(symbols) {
        return [
            {
                channel: 'ticker',
                symbols
            }
        ];
    }
    *map(ticker, localTimestamp) {
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(ticker.product_id, 'cryptofacilities');
        pendingTickerInfo.updateFundingRate(ticker.funding_rate);
        pendingTickerInfo.updatePredictedFundingRate(ticker.funding_rate_prediction);
        pendingTickerInfo.updateFundingTimestamp(ticker.next_funding_rate_time !== undefined ? new Date(ticker.next_funding_rate_time) : undefined);
        pendingTickerInfo.updateIndexPrice(ticker.index);
        pendingTickerInfo.updateMarkPrice(ticker.markPrice);
        pendingTickerInfo.updateOpenInterest(ticker.openInterest);
        pendingTickerInfo.updateLastPrice(ticker.last);
        pendingTickerInfo.updateTimestamp(new Date(ticker.time));
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.CryptofacilitiesDerivativeTickerMapper = CryptofacilitiesDerivativeTickerMapper;
exports.cryptofacilitiesLiquidationsMapper = {
    canHandle(message) {
        return message.feed === 'trade' && message.event === undefined && message.type === 'liquidation';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(liquidationTrade, localTimestamp) {
        yield {
            type: 'liquidation',
            symbol: liquidationTrade.product_id,
            exchange: 'cryptofacilities',
            id: liquidationTrade.uid,
            price: liquidationTrade.price,
            amount: liquidationTrade.qty,
            side: liquidationTrade.side,
            timestamp: new Date(liquidationTrade.time),
            localTimestamp: localTimestamp
        };
    }
};
//# sourceMappingURL=cryptofacilities.js.map