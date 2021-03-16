"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bitmexLiquidationsMapper = exports.BitmexDerivativeTickerMapper = exports.BitmexBookChangeMapper = exports.bitmexTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://www.bitmex.com/app/wsAPI
exports.bitmexTradesMapper = {
    canHandle(message) {
        return message.table === 'trade' && message.action === 'insert';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(bitmexTradesMessage, localTimestamp) {
        for (const bitmexTrade of bitmexTradesMessage.data) {
            const trade = {
                type: 'trade',
                symbol: bitmexTrade.symbol,
                exchange: 'bitmex',
                id: bitmexTrade.trdMatchID,
                price: bitmexTrade.price,
                amount: bitmexTrade.size,
                side: bitmexTrade.side !== undefined ? (bitmexTrade.side === 'Buy' ? 'buy' : 'sell') : 'unknown',
                timestamp: new Date(bitmexTrade.timestamp),
                localTimestamp: localTimestamp
            };
            yield trade;
        }
    }
};
class BitmexBookChangeMapper {
    constructor() {
        this._idToPriceLevelMap = new Map();
    }
    canHandle(message) {
        return message.table === 'orderBookL2';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'orderBookL2',
                symbols
            }
        ];
    }
    *map(bitmexOrderBookL2Message, localTimestamp) {
        let bitmexBookMessagesGrouppedBySymbol;
        // only partial messages can contain different symbols (when subscribed via {"op": "subscribe", "args": ["orderBookL2"]} for example)
        if (bitmexOrderBookL2Message.action === 'partial') {
            bitmexBookMessagesGrouppedBySymbol = bitmexOrderBookL2Message.data.reduce((prev, current) => {
                if (prev[current.symbol]) {
                    prev[current.symbol].push(current);
                }
                else {
                    prev[current.symbol] = [current];
                }
                return prev;
            }, {});
        }
        else {
            // in case of other messages types BitMEX always returns data for single symbol
            bitmexBookMessagesGrouppedBySymbol = {
                [bitmexOrderBookL2Message.data[0].symbol]: bitmexOrderBookL2Message.data
            };
        }
        for (let symbol in bitmexBookMessagesGrouppedBySymbol) {
            const bids = [];
            const asks = [];
            for (const item of bitmexBookMessagesGrouppedBySymbol[symbol]) {
                // https://www.bitmex.com/app/restAPI#OrderBookL2
                if (item.price !== undefined) {
                    // store the mapping from id to price level if price is specified
                    // only partials and inserts have price set
                    this._idToPriceLevelMap.set(item.id, item.price);
                }
                const price = this._idToPriceLevelMap.get(item.id);
                const amount = item.size || 0; // delete messages do not have size specified
                // if we still don't have a price it means that there was an update before partial message - let's skip it
                if (price === undefined) {
                    continue;
                }
                if (item.side === 'Buy') {
                    bids.push({ price, amount });
                }
                else {
                    asks.push({ price, amount });
                }
                // remove meta info for deleted level
                if (bitmexOrderBookL2Message.action === 'delete') {
                    this._idToPriceLevelMap.delete(item.id);
                }
            }
            if (bids.length > 0 || asks.length > 0) {
                const bookChange = {
                    type: 'book_change',
                    symbol,
                    exchange: 'bitmex',
                    isSnapshot: bitmexOrderBookL2Message.action === 'partial',
                    bids,
                    asks,
                    timestamp: localTimestamp,
                    localTimestamp: localTimestamp
                };
                yield bookChange;
            }
        }
    }
}
exports.BitmexBookChangeMapper = BitmexBookChangeMapper;
class BitmexDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return message.table === 'instrument';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'instrument',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        for (const bitmexInstrument of message.data) {
            // process instrument messages only if:
            // - we already have seen their 'partials' or already have 'pending info'
            // - and instruments aren't settled or unlisted already
            const isOpen = bitmexInstrument.state === undefined || bitmexInstrument.state === 'Open' || bitmexInstrument.state === 'Closed';
            const isPartial = message.action === 'partial';
            const hasPendingInfo = this.pendingTickerInfoHelper.hasPendingTickerInfo(bitmexInstrument.symbol);
            if ((isPartial || hasPendingInfo) && isOpen) {
                const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(bitmexInstrument.symbol, 'bitmex');
                pendingTickerInfo.updateFundingRate(bitmexInstrument.fundingRate);
                pendingTickerInfo.updatePredictedFundingRate(bitmexInstrument.indicativeFundingRate);
                pendingTickerInfo.updateFundingTimestamp(bitmexInstrument.fundingTimestamp ? new Date(bitmexInstrument.fundingTimestamp) : undefined);
                pendingTickerInfo.updateIndexPrice(bitmexInstrument.indicativeSettlePrice);
                pendingTickerInfo.updateMarkPrice(bitmexInstrument.markPrice);
                pendingTickerInfo.updateOpenInterest(bitmexInstrument.openInterest);
                pendingTickerInfo.updateLastPrice(bitmexInstrument.lastPrice);
                if (bitmexInstrument.timestamp !== undefined) {
                    pendingTickerInfo.updateTimestamp(new Date(bitmexInstrument.timestamp));
                }
                if (pendingTickerInfo.hasChanged()) {
                    yield pendingTickerInfo.getSnapshot(localTimestamp);
                }
            }
        }
    }
}
exports.BitmexDerivativeTickerMapper = BitmexDerivativeTickerMapper;
exports.bitmexLiquidationsMapper = {
    canHandle(message) {
        return message.table === 'liquidation' && message.action === 'insert';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'liquidation',
                symbols
            }
        ];
    },
    *map(bitmexLiquiationsMessage, localTimestamp) {
        for (const bitmexLiquidation of bitmexLiquiationsMessage.data) {
            const liquidation = {
                type: 'liquidation',
                symbol: bitmexLiquidation.symbol,
                exchange: 'bitmex',
                id: bitmexLiquidation.orderID,
                price: bitmexLiquidation.price,
                amount: bitmexLiquidation.leavesQty,
                side: bitmexLiquidation.side === 'Buy' ? 'buy' : 'sell',
                timestamp: localTimestamp,
                localTimestamp: localTimestamp
            };
            yield liquidation;
        }
    }
};
//# sourceMappingURL=bitmex.js.map