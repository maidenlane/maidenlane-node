"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinflexDerivativeTickerMapper = exports.coinflexBookChangeMapper = exports.coinflexTradesMapper = void 0;
const mapper_1 = require("./mapper");
// https://docs.coinflex.com/v2/#websocket-api-subscriptions-public
exports.coinflexTradesMapper = {
    canHandle(message) {
        return message.table === 'trade';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    },
    *map(coinflexTrades, localTimestamp) {
        for (const trade of coinflexTrades.data) {
            yield {
                type: 'trade',
                symbol: trade.marketCode,
                exchange: 'coinflex',
                id: trade.tradeId,
                price: Number(trade.price),
                amount: Number(trade.quantity),
                side: trade.side === 'SELL' ? 'sell' : 'buy',
                timestamp: new Date(Number(trade.timestamp)),
                localTimestamp: localTimestamp
            };
        }
    }
};
const mapBookLevel = (level) => {
    const price = Number(level[0]);
    const amount = Number(level[1]);
    return { price, amount };
};
exports.coinflexBookChangeMapper = {
    canHandle(message) {
        return message.table === 'futures/depth';
    },
    getFilters(symbols) {
        return [
            {
                channel: 'futures/depth',
                symbols
            }
        ];
    },
    *map(depthMessage, localTimestamp) {
        for (const change of depthMessage.data) {
            yield {
                type: 'book_change',
                symbol: change.instrumentId,
                exchange: 'coinflex',
                isSnapshot: depthMessage.action === 'partial',
                bids: change.bids.map(mapBookLevel),
                asks: change.asks.map(mapBookLevel),
                timestamp: new Date(Number(change.timestamp)),
                localTimestamp
            };
        }
    }
};
class CoinflexDerivativeTickerMapper {
    constructor() {
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        return message.table === 'ticker';
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
        for (const ticker of message.data) {
            // exclude spot symbols
            if (ticker.marketCode.split('-').length === 2) {
                continue;
            }
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(ticker.marketCode, 'coinflex');
            if (ticker.markPrice !== undefined) {
                pendingTickerInfo.updateMarkPrice(Number(ticker.markPrice));
            }
            if (ticker.openInterest !== undefined) {
                pendingTickerInfo.updateOpenInterest(Number(ticker.openInterest));
            }
            if (ticker.last !== undefined) {
                pendingTickerInfo.updateLastPrice(Number(ticker.last));
            }
            pendingTickerInfo.updateTimestamp(new Date(Number(ticker.timestamp)));
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
    }
}
exports.CoinflexDerivativeTickerMapper = CoinflexDerivativeTickerMapper;
//# sourceMappingURL=coinflex.js.map