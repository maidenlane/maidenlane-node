"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhemexDerivativeTickerMapper = exports.phemexBookChangeMapper = exports.phemexTradesMapper = void 0;
const mapper_1 = require("./mapper");
// phemex provides timestamps in nanoseconds
const fromNanoSecondsToDate = (nanos) => {
    const microtimestamp = Math.floor(nanos / 1000);
    const timestamp = new Date(microtimestamp / 1000);
    timestamp.μs = microtimestamp % 1000;
    return timestamp;
};
function getPriceScale(symbol) {
    if (symbol.startsWith('s')) {
        return 1e8;
    }
    return 1e4;
}
function getQtyScale(symbol) {
    if (symbol.startsWith('s')) {
        return 1e8;
    }
    return 1;
}
function getSymbols(symbols) {
    if (symbols === undefined) {
        return;
    }
    return symbols.map((symbol) => {
        if (symbol.startsWith('S')) {
            return symbol.charAt(0).toLowerCase() + symbol.slice(1);
        }
        return symbol;
    });
}
exports.phemexTradesMapper = {
    canHandle(message) {
        return 'trades' in message && message.type === 'incremental';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trades',
                symbols: getSymbols(symbols)
            }
        ];
    },
    *map(message, localTimestamp) {
        for (const [timestamp, side, priceEp, qty] of message.trades) {
            const symbol = message.symbol;
            yield {
                type: 'trade',
                symbol: symbol.toUpperCase(),
                exchange: 'phemex',
                id: undefined,
                price: priceEp / getPriceScale(symbol),
                amount: qty / getQtyScale(symbol),
                side: side === 'Buy' ? 'buy' : 'sell',
                timestamp: fromNanoSecondsToDate(timestamp),
                localTimestamp: localTimestamp
            };
        }
    }
};
const mapBookLevelForSymbol = (symbol) => ([priceEp, qty]) => {
    return {
        price: priceEp / getPriceScale(symbol),
        amount: qty / getQtyScale(symbol)
    };
};
exports.phemexBookChangeMapper = {
    canHandle(message) {
        return 'book' in message;
    },
    getFilters(symbols) {
        return [
            {
                channel: 'book',
                symbols: getSymbols(symbols)
            }
        ];
    },
    *map(message, localTimestamp) {
        const symbol = message.symbol;
        const mapBookLevel = mapBookLevelForSymbol(symbol);
        yield {
            type: 'book_change',
            symbol: symbol.toUpperCase(),
            exchange: 'phemex',
            isSnapshot: message.type === 'snapshot',
            bids: message.book.bids.map(mapBookLevel),
            asks: message.book.asks.map(mapBookLevel),
            timestamp: fromNanoSecondsToDate(message.timestamp),
            localTimestamp
        };
    }
};
class PhemexDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return 'market24h' in message;
    }
    getFilters(symbols) {
        return [
            {
                channel: 'market24h',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(message.market24h.symbol, 'phemex');
        const phemexTicker = message.market24h;
        pendingTickerInfo.updateFundingRate(phemexTicker.fundingRate / 100000000);
        pendingTickerInfo.updatePredictedFundingRate(phemexTicker.predFundingRate / 100000000);
        pendingTickerInfo.updateIndexPrice(phemexTicker.indexPrice / 10000);
        pendingTickerInfo.updateMarkPrice(phemexTicker.markPrice / 10000);
        pendingTickerInfo.updateOpenInterest(phemexTicker.openInterest);
        pendingTickerInfo.updateLastPrice(phemexTicker.close / 10000);
        pendingTickerInfo.updateTimestamp(fromNanoSecondsToDate(message.timestamp));
        if (pendingTickerInfo.hasChanged()) {
            yield pendingTickerInfo.getSnapshot(localTimestamp);
        }
    }
}
exports.PhemexDerivativeTickerMapper = PhemexDerivativeTickerMapper;
//# sourceMappingURL=phemex.js.map