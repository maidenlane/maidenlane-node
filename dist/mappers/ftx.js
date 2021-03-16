"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTXLiquidationsMapper = exports.FTXDerivativeTickerMapper = exports.FTXBookChangeMapper = exports.mapBookLevel = exports.FTXTradesMapper = void 0;
const handy_1 = require("../handy");
const mapper_1 = require("./mapper");
// https://docs.ftx.com/#websocket-api
class FTXTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.data == undefined) {
            return false;
        }
        return message.channel === 'trades';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    }
    *map(ftxTrades, localTimestamp) {
        for (const ftxTrade of ftxTrades.data) {
            const timestamp = new Date(ftxTrade.time);
            timestamp.μs = handy_1.parseμs(ftxTrade.time);
            yield {
                type: 'trade',
                symbol: ftxTrades.market,
                exchange: this._exchange,
                id: ftxTrade.id !== null ? String(ftxTrade.id) : undefined,
                price: ftxTrade.price,
                amount: ftxTrade.size,
                side: ftxTrade.side,
                timestamp,
                localTimestamp
            };
        }
    }
}
exports.FTXTradesMapper = FTXTradesMapper;
const mapBookLevel = (level) => {
    const price = level[0];
    const amount = level[1];
    return { price, amount };
};
exports.mapBookLevel = mapBookLevel;
class FTXBookChangeMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.data == undefined) {
            return false;
        }
        return message.channel === 'orderbook';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'orderbook',
                symbols
            }
        ];
    }
    *map(ftxOrderBook, localTimestamp) {
        const isEmptyUpdate = ftxOrderBook.type === 'update' && ftxOrderBook.data.bids.length === 0 && ftxOrderBook.data.asks.length === 0;
        if (isEmptyUpdate) {
            return;
        }
        const timestamp = new Date(ftxOrderBook.data.time * 1000);
        timestamp.μs = Math.floor(ftxOrderBook.data.time * 1000000) % 1000;
        yield {
            type: 'book_change',
            symbol: ftxOrderBook.market,
            exchange: this._exchange,
            isSnapshot: ftxOrderBook.type === 'partial',
            bids: ftxOrderBook.data.bids.map(exports.mapBookLevel),
            asks: ftxOrderBook.data.asks.map(exports.mapBookLevel),
            timestamp,
            localTimestamp
        };
    }
}
exports.FTXBookChangeMapper = FTXBookChangeMapper;
class FTXDerivativeTickerMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        if (message.data == undefined) {
            return false;
        }
        return message.channel === 'instrument';
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
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(message.market, this._exchange);
        const { stats, info } = message.data;
        if (stats.nextFundingTime !== undefined) {
            pendingTickerInfo.updateFundingTimestamp(new Date(stats.nextFundingTime));
            pendingTickerInfo.updateFundingRate(stats.nextFundingRate);
        }
        pendingTickerInfo.updateIndexPrice(info.index);
        pendingTickerInfo.updateMarkPrice(info.mark);
        pendingTickerInfo.updateLastPrice(info.last);
        pendingTickerInfo.updateOpenInterest(stats.openInterest);
        pendingTickerInfo.updateTimestamp(localTimestamp);
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.FTXDerivativeTickerMapper = FTXDerivativeTickerMapper;
class FTXLiquidationsMapper {
    canHandle(message) {
        if (message.data == undefined) {
            return false;
        }
        return message.channel === 'trades';
    }
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols
            }
        ];
    }
    *map(ftxTrades, localTimestamp) {
        for (const ftxTrade of ftxTrades.data) {
            if (ftxTrade.liquidation) {
                const timestamp = new Date(ftxTrade.time);
                timestamp.μs = handy_1.parseμs(ftxTrade.time);
                yield {
                    type: 'liquidation',
                    symbol: ftxTrades.market,
                    exchange: 'ftx',
                    id: ftxTrade.id !== null ? String(ftxTrade.id) : undefined,
                    price: ftxTrade.price,
                    amount: ftxTrade.size,
                    side: ftxTrade.side,
                    timestamp,
                    localTimestamp
                };
            }
        }
    }
}
exports.FTXLiquidationsMapper = FTXLiquidationsMapper;
//# sourceMappingURL=ftx.js.map