"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OkexLiquidationsMapper = exports.OkexOptionSummaryMapper = exports.OkexDerivativeTickerMapper = exports.OkexBookChangeMapper = exports.OkexTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://www.okex.com/docs/en/#ws_swap-README
class OkexTradesMapper {
    constructor(_exchange, _market) {
        this._exchange = _exchange;
        this._market = _market;
        this._seenSymbols = new Set();
    }
    canHandle(message) {
        return message.table === `${this._market}/trade`;
    }
    getFilters(symbols) {
        return [
            {
                channel: `${this._market}/trade`,
                symbols
            }
        ];
    }
    *map(okexTradesMessage, localTimestamp) {
        for (const okexTrade of okexTradesMessage.data) {
            const symbol = okexTrade.instrument_id;
            // always ignore first returned trade as it's a 'stale' trade, which has already been published before disconnect
            if (this._seenSymbols.has(symbol) === false) {
                this._seenSymbols.add(symbol);
                break;
            }
            yield {
                type: 'trade',
                symbol,
                exchange: this._exchange,
                id: typeof okexTrade.trade_id === 'string' ? okexTrade.trade_id : undefined,
                price: Number(okexTrade.price),
                amount: okexTrade.qty !== undefined ? Number(okexTrade.qty) : Number(okexTrade.size),
                side: okexTrade.side,
                timestamp: new Date(okexTrade.timestamp),
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.OkexTradesMapper = OkexTradesMapper;
const mapBookLevel = (level) => {
    const price = Number(level[0]);
    const amount = Number(level[1]);
    return { price, amount };
};
class OkexBookChangeMapper {
    constructor(_exchange, _market, _canUseTickByTickChannel) {
        this._exchange = _exchange;
        this._market = _market;
        this._canUseTickByTickChannel = _canUseTickByTickChannel;
    }
    canHandle(message) {
        const channelSuffix = this._canUseTickByTickChannel ? 'depth_l2_tbt' : 'depth';
        return message.table === `${this._market}/${channelSuffix}`;
    }
    getFilters(symbols) {
        if (this._canUseTickByTickChannel) {
            return [
                {
                    channel: `${this._market}/depth_l2_tbt`,
                    symbols
                }
            ];
        }
        // subscribe to both book channels and in canHandle decide which one to use
        // as one can subscribe to date range period that overlaps both when only depth channel has been available
        // and when both were available (both depth and depth_l2_tbt)
        return [
            {
                channel: `${this._market}/depth_l2_tbt`,
                symbols
            },
            {
                channel: `${this._market}/depth`,
                symbols
            }
        ];
    }
    *map(okexDepthDataMessage, localTimestamp) {
        for (const message of okexDepthDataMessage.data) {
            if (message.bids.length === 0 && message.asks.length === 0) {
                continue;
            }
            const timestamp = new Date(message.timestamp);
            if (timestamp.valueOf() === 0) {
                continue;
            }
            yield {
                type: 'book_change',
                symbol: message.instrument_id,
                exchange: this._exchange,
                isSnapshot: okexDepthDataMessage.action === 'partial',
                bids: message.bids.map(mapBookLevel),
                asks: message.asks.map(mapBookLevel),
                timestamp,
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.OkexBookChangeMapper = OkexBookChangeMapper;
class OkexDerivativeTickerMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
        this._futuresChannels = ['futures/ticker', 'futures/mark_price'];
        this._swapChannels = ['swap/ticker', 'swap/mark_price', 'swap/funding_rate'];
    }
    canHandle(message) {
        const channels = this._exchange === 'okex-futures' ? this._futuresChannels : this._swapChannels;
        return channels.includes(message.table);
    }
    getFilters(symbols) {
        const channels = this._exchange === 'okex-futures' ? this._futuresChannels : this._swapChannels;
        return channels.map((channel) => {
            return {
                channel,
                symbols
            };
        });
    }
    *map(message, localTimestamp) {
        for (const okexMessage of message.data) {
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(okexMessage.instrument_id, this._exchange);
            if ('funding_rate' in okexMessage) {
                pendingTickerInfo.updateFundingRate(Number(okexMessage.funding_rate));
                pendingTickerInfo.updateFundingTimestamp(new Date(okexMessage.funding_time));
                if (okexMessage.estimated_rate !== undefined) {
                    pendingTickerInfo.updatePredictedFundingRate(Number(okexMessage.estimated_rate));
                }
            }
            if ('mark_price' in okexMessage) {
                pendingTickerInfo.updateMarkPrice(Number(okexMessage.mark_price));
            }
            if ('open_interest' in okexMessage) {
                const openInterest = Number(okexMessage.open_interest);
                if (openInterest > 0) {
                    pendingTickerInfo.updateOpenInterest(Number(okexMessage.open_interest));
                }
            }
            if ('last' in okexMessage) {
                pendingTickerInfo.updateLastPrice(Number(okexMessage.last));
            }
            if (okexMessage.timestamp !== undefined) {
                pendingTickerInfo.updateTimestamp(new Date(okexMessage.timestamp));
            }
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
    }
}
exports.OkexDerivativeTickerMapper = OkexDerivativeTickerMapper;
function asNumberIfValid(val) {
    if (val === undefined || val === null) {
        return;
    }
    var asNumber = Number(val);
    if (isNaN(asNumber) || isFinite(asNumber) === false) {
        return;
    }
    if (asNumber === 0) {
        return;
    }
    return asNumber;
}
class OkexOptionSummaryMapper {
    constructor() {
        this._indexPrices = new Map();
        this.expiration_regex = /(\d{2})(\d{2})(\d{2})/;
    }
    canHandle(message) {
        return message.table === 'index/ticker' || message.table === 'option/summary';
    }
    getFilters(symbols) {
        const indexes = symbols !== undefined
            ? symbols.map((s) => {
                const symbolParts = s.split('-');
                return `${symbolParts[0]}-${symbolParts[1]}`;
            })
            : undefined;
        return [
            {
                channel: `option/summary`,
                symbols
            },
            {
                channel: `index/ticker`,
                symbols: indexes
            }
        ];
    }
    *map(message, localTimestamp) {
        if (message.table === 'index/ticker') {
            for (const index of message.data) {
                const lastIndexPrice = Number(index.last);
                if (lastIndexPrice > 0) {
                    this._indexPrices.set(index.instrument_id, lastIndexPrice);
                }
            }
            return;
        }
        for (const summary of message.data) {
            const symbolParts = summary.instrument_id.split('-');
            const isPut = symbolParts[4] === 'P';
            const strikePrice = Number(symbolParts[3]);
            var dateArray = this.expiration_regex.exec(symbolParts[2]);
            const expirationDate = new Date(Date.UTC(+('20' + dateArray[1]), +dateArray[2] - 1, +dateArray[3], 8, 0, 0, 0));
            const lastUnderlyingPrice = this._indexPrices.get(summary.underlying);
            const optionSummary = {
                type: 'option_summary',
                symbol: summary.instrument_id,
                exchange: 'okex-options',
                optionType: isPut ? 'put' : 'call',
                strikePrice,
                expirationDate,
                bestBidPrice: asNumberIfValid(summary.best_bid),
                bestBidAmount: asNumberIfValid(summary.best_bid_size),
                bestBidIV: asNumberIfValid(summary.bid_vol),
                bestAskPrice: asNumberIfValid(summary.best_ask),
                bestAskAmount: asNumberIfValid(summary.best_ask_size),
                bestAskIV: asNumberIfValid(summary.ask_vol),
                lastPrice: asNumberIfValid(summary.last),
                openInterest: asNumberIfValid(summary.open_interest),
                markPrice: asNumberIfValid(summary.mark_price),
                markIV: asNumberIfValid(summary.mark_vol),
                delta: asNumberIfValid(summary.delta),
                gamma: asNumberIfValid(summary.gamma),
                vega: asNumberIfValid(summary.vega),
                theta: asNumberIfValid(summary.theta),
                rho: undefined,
                underlyingPrice: lastUnderlyingPrice,
                underlyingIndex: summary.underlying,
                timestamp: new Date(summary.timestamp),
                localTimestamp: localTimestamp
            };
            yield optionSummary;
        }
    }
}
exports.OkexOptionSummaryMapper = OkexOptionSummaryMapper;
class OkexLiquidationsMapper {
    constructor(_exchange, _market) {
        this._exchange = _exchange;
        this._market = _market;
    }
    canHandle(message) {
        return message.table === `${this._market}/liquidation`;
    }
    getFilters(symbols) {
        return [
            {
                channel: `${this._market}/liquidation`,
                symbols
            }
        ];
    }
    *map(okexLiquidationDataMessage, localTimestamp) {
        for (const okexLiquidation of okexLiquidationDataMessage.data) {
            const liquidation = {
                type: 'liquidation',
                symbol: okexLiquidation.instrument_id,
                exchange: this._exchange,
                id: undefined,
                price: Number(okexLiquidation.price),
                amount: Number(okexLiquidation.size),
                side: okexLiquidation.type === '3' ? 'sell' : 'buy',
                timestamp: new Date(okexLiquidation.created_at),
                localTimestamp: localTimestamp
            };
            yield liquidation;
        }
    }
}
exports.OkexLiquidationsMapper = OkexLiquidationsMapper;
//# sourceMappingURL=okex.js.map