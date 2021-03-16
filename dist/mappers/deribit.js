"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deribitLiquidationsMapper = exports.DeribitOptionSummaryMapper = exports.DeribitDerivativeTickerMapper = exports.deribitBookChangeMapper = exports.deribitTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://docs.deribit.com/v2/#subscriptions
exports.deribitTradesMapper = {
    canHandle(message) {
        const channel = message.params !== undefined ? message.params.channel : undefined;
        if (channel === undefined) {
            return false;
        }
        return channel.startsWith('trades');
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        for (const deribitTrade of message.params.data) {
            yield {
                type: 'trade',
                symbol: deribitTrade.instrument_name,
                exchange: 'deribit',
                id: deribitTrade.trade_id,
                price: deribitTrade.price,
                amount: deribitTrade.amount,
                side: deribitTrade.direction,
                timestamp: new Date(deribitTrade.timestamp),
                localTimestamp: localTimestamp
            };
        }
    }
};
const mapBookLevel = (level) => {
    const price = level[1];
    const amount = level[0] === 'delete' ? 0 : level[2];
    return { price, amount };
};
exports.deribitBookChangeMapper = {
    canHandle(message) {
        const channel = message.params && message.params.channel;
        if (channel === undefined) {
            return false;
        }
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
        const deribitBookChange = message.params.data;
        // snapshots do not have prev_change_id set
        const isSnapshot = deribitBookChange.prev_change_id === undefined;
        yield {
            type: 'book_change',
            symbol: deribitBookChange.instrument_name,
            exchange: 'deribit',
            isSnapshot,
            bids: deribitBookChange.bids.map(mapBookLevel),
            asks: deribitBookChange.asks.map(mapBookLevel),
            timestamp: new Date(deribitBookChange.timestamp),
            localTimestamp: localTimestamp
        };
    }
};
class DeribitDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        const channel = message.params && message.params.channel;
        if (channel === undefined) {
            return false;
        }
        // exclude options tickers
        return channel.startsWith('ticker') && message.params.data.greeks === undefined;
    }
    getFilters(symbols) {
        return [
            {
                channel: 'ticker',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const deribitTicker = message.params.data;
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(deribitTicker.instrument_name, 'deribit');
        pendingTickerInfo.updateFundingRate(deribitTicker.current_funding);
        pendingTickerInfo.updateIndexPrice(deribitTicker.index_price);
        pendingTickerInfo.updateMarkPrice(deribitTicker.mark_price);
        pendingTickerInfo.updateOpenInterest(deribitTicker.open_interest);
        pendingTickerInfo.updateLastPrice(deribitTicker.last_price);
        pendingTickerInfo.updateTimestamp(new Date(deribitTicker.timestamp));
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.DeribitDerivativeTickerMapper = DeribitDerivativeTickerMapper;
class DeribitOptionSummaryMapper {
    getFilters(symbols) {
        return [
            {
                channel: 'ticker',
                symbols
            }
        ];
    }
    canHandle(message) {
        const channel = message.params && message.params.channel;
        if (channel === undefined) {
            return false;
        }
        // options ticker has greeks
        return channel.startsWith('ticker') && message.params.data.greeks !== undefined;
    }
    *map(message, localTimestamp) {
        const optionInfo = message.params.data;
        //e.g., BTC-8JUN20-8750-P
        const symbolParts = optionInfo.instrument_name.split('-');
        const isPut = symbolParts[3] === 'P';
        const strikePrice = Number(symbolParts[2]);
        const expirationDate = new Date(symbolParts[1] + 'Z');
        expirationDate.setUTCHours(8);
        const optionSummary = {
            type: 'option_summary',
            symbol: optionInfo.instrument_name,
            exchange: 'deribit',
            optionType: isPut ? 'put' : 'call',
            strikePrice,
            expirationDate,
            bestBidPrice: optionInfo.best_bid_price === 0 ? undefined : optionInfo.best_bid_price,
            bestBidAmount: optionInfo.best_bid_amount === 0 ? undefined : optionInfo.best_bid_amount,
            bestBidIV: optionInfo.bid_iv === 0 ? undefined : optionInfo.bid_iv,
            bestAskPrice: optionInfo.best_ask_price === 0 ? undefined : optionInfo.best_ask_price,
            bestAskAmount: optionInfo.best_ask_amount === 0 ? undefined : optionInfo.best_ask_amount,
            bestAskIV: optionInfo.ask_iv === 0 ? undefined : optionInfo.ask_iv,
            lastPrice: optionInfo.last_price !== null ? optionInfo.last_price : undefined,
            openInterest: optionInfo.open_interest,
            markPrice: optionInfo.mark_price,
            markIV: optionInfo.mark_iv,
            delta: optionInfo.greeks.delta,
            gamma: optionInfo.greeks.gamma,
            vega: optionInfo.greeks.vega,
            theta: optionInfo.greeks.theta,
            rho: optionInfo.greeks.rho,
            underlyingPrice: optionInfo.underlying_price,
            underlyingIndex: optionInfo.underlying_index,
            timestamp: new Date(optionInfo.timestamp),
            localTimestamp: localTimestamp
        };
        yield optionSummary;
    }
}
exports.DeribitOptionSummaryMapper = DeribitOptionSummaryMapper;
exports.deribitLiquidationsMapper = {
    canHandle(message) {
        const channel = message.params !== undefined ? message.params.channel : undefined;
        if (channel === undefined) {
            return false;
        }
        return channel.startsWith('trades');
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    },
    *map(message, localTimestamp) {
        for (const deribitTrade of message.params.data) {
            if (deribitTrade.liquidation !== undefined) {
                let side;
                // "T" when liquidity taker side was under liquidation
                if (deribitTrade.liquidation === 'T') {
                    side = deribitTrade.direction;
                }
                else {
                    // "M" when maker (passive) side of trade was under liquidation
                    side = deribitTrade.direction === 'buy' ? 'sell' : 'buy';
                }
                yield {
                    type: 'liquidation',
                    symbol: deribitTrade.instrument_name,
                    exchange: 'deribit',
                    id: deribitTrade.trade_id,
                    price: deribitTrade.price,
                    amount: deribitTrade.amount,
                    side,
                    timestamp: new Date(deribitTrade.timestamp),
                    localTimestamp: localTimestamp
                };
            }
        }
    }
};
//# sourceMappingURL=deribit.js.map