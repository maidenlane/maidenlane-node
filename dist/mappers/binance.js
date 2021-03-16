"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceLiquidationsMapper = exports.BinanceFuturesDerivativeTickerMapper = exports.BinanceFuturesBookChangeMapper = exports.BinanceBookChangeMapper = exports.BinanceTradesMapper = void 0;
const debug_1 = require("../debug");
const handy_1 = require("../handy");
const mapper_1 = require("./mapper");
// https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md
class BinanceTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.stream === undefined) {
            return false;
        }
        return message.stream.endsWith('@trade');
    }
    getFilters(symbols) {
        symbols = lowerCaseSymbols(symbols);
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    }
    *map(binanceTradeResponse, localTimestamp) {
        const binanceTrade = binanceTradeResponse.data;
        const isOffBookTrade = binanceTrade.X === 'INSURANCE_FUND';
        if (isOffBookTrade) {
            return;
        }
        const trade = {
            type: 'trade',
            symbol: binanceTrade.s,
            exchange: this._exchange,
            id: String(binanceTrade.t),
            price: Number(binanceTrade.p),
            amount: Number(binanceTrade.q),
            side: binanceTrade.m ? 'sell' : 'buy',
            timestamp: new Date(binanceTrade.T),
            localTimestamp: localTimestamp
        };
        yield trade;
    }
}
exports.BinanceTradesMapper = BinanceTradesMapper;
class BinanceBookChangeMapper {
    constructor(exchange, ignoreBookSnapshotOverlapError) {
        this.exchange = exchange;
        this.ignoreBookSnapshotOverlapError = ignoreBookSnapshotOverlapError;
        this.symbolToDepthInfoMapping = {};
    }
    canHandle(message) {
        if (message.stream === undefined) {
            return false;
        }
        return message.stream.includes('@depth');
    }
    getFilters(symbols) {
        symbols = lowerCaseSymbols(symbols);
        return [
            {
                channel: 'depth',
                symbols
            },
            {
                channel: 'depthSnapshot',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const symbol = message.stream.split('@')[0].toUpperCase();
        if (this.symbolToDepthInfoMapping[symbol] === undefined) {
            this.symbolToDepthInfoMapping[symbol] = {
                bufferedUpdates: new handy_1.CircularBuffer(2000)
            };
        }
        const symbolDepthInfo = this.symbolToDepthInfoMapping[symbol];
        const snapshotAlreadyProcessed = symbolDepthInfo.snapshotProcessed;
        // first check if received message is snapshot and process it as such if it is
        if (message.data.lastUpdateId !== undefined) {
            // if we've already received 'manual' snapshot, ignore if there is another one
            if (snapshotAlreadyProcessed) {
                return;
            }
            // produce snapshot book_change
            const binanceDepthSnapshotData = message.data;
            //  mark given symbol depth info that has snapshot processed
            symbolDepthInfo.lastUpdateId = binanceDepthSnapshotData.lastUpdateId;
            symbolDepthInfo.snapshotProcessed = true;
            // if there were any depth updates buffered, let's proccess those by adding to or updating the initial snapshot
            for (const update of symbolDepthInfo.bufferedUpdates.items()) {
                const bookChange = this.mapBookDepthUpdate(update, localTimestamp);
                if (bookChange !== undefined) {
                    for (const bid of update.b) {
                        const matchingBid = binanceDepthSnapshotData.bids.find((b) => b[0] === bid[0]);
                        if (matchingBid !== undefined) {
                            matchingBid[1] = bid[1];
                        }
                        else {
                            binanceDepthSnapshotData.bids.push(bid);
                        }
                    }
                    for (const ask of update.a) {
                        const matchingAsk = binanceDepthSnapshotData.asks.find((a) => a[0] === ask[0]);
                        if (matchingAsk !== undefined) {
                            matchingAsk[1] = ask[1];
                        }
                        else {
                            binanceDepthSnapshotData.asks.push(ask);
                        }
                    }
                }
            }
            // remove all buffered updates
            symbolDepthInfo.bufferedUpdates.clear();
            const bookChange = {
                type: 'book_change',
                symbol,
                exchange: this.exchange,
                isSnapshot: true,
                bids: binanceDepthSnapshotData.bids.map(this.mapBookLevel),
                asks: binanceDepthSnapshotData.asks.map(this.mapBookLevel),
                timestamp: binanceDepthSnapshotData.T !== undefined ? new Date(binanceDepthSnapshotData.T) : localTimestamp,
                localTimestamp
            };
            yield bookChange;
        }
        else if (snapshotAlreadyProcessed) {
            // snapshot was already processed let's map the message as normal book_change
            const bookChange = this.mapBookDepthUpdate(message.data, localTimestamp);
            if (bookChange !== undefined) {
                yield bookChange;
            }
        }
        else {
            const binanceDepthUpdateData = message.data;
            symbolDepthInfo.bufferedUpdates.append(binanceDepthUpdateData);
        }
    }
    mapBookDepthUpdate(binanceDepthUpdateData, localTimestamp) {
        // we can safely assume here that depthContext and lastUpdateId aren't null here as this is method only works
        // when we've already processed the snapshot
        const depthContext = this.symbolToDepthInfoMapping[binanceDepthUpdateData.s];
        const lastUpdateId = depthContext.lastUpdateId;
        // Drop any event where u is <= lastUpdateId in the snapshot
        if (binanceDepthUpdateData.u <= lastUpdateId) {
            return;
        }
        // The first processed event should have U <= lastUpdateId+1 AND u >= lastUpdateId+1.
        if (!depthContext.validatedFirstUpdate) {
            // if there is new instrument added it can have empty book at first and that's normal
            const bookSnapshotIsEmpty = lastUpdateId == -1;
            if ((binanceDepthUpdateData.U <= lastUpdateId + 1 && binanceDepthUpdateData.u >= lastUpdateId + 1) || bookSnapshotIsEmpty) {
                depthContext.validatedFirstUpdate = true;
            }
            else {
                const message = `Book depth snaphot has no overlap with first update, update ${JSON.stringify(binanceDepthUpdateData)}, lastUpdateId: ${lastUpdateId}, exchange ${this.exchange}`;
                if (this.ignoreBookSnapshotOverlapError) {
                    depthContext.validatedFirstUpdate = true;
                    debug_1.debug(message);
                }
                else {
                    throw new Error(message);
                }
            }
        }
        return {
            type: 'book_change',
            symbol: binanceDepthUpdateData.s,
            exchange: this.exchange,
            isSnapshot: false,
            bids: binanceDepthUpdateData.b.map(this.mapBookLevel),
            asks: binanceDepthUpdateData.a.map(this.mapBookLevel),
            timestamp: new Date(binanceDepthUpdateData.E),
            localTimestamp: localTimestamp
        };
    }
    mapBookLevel(level) {
        const price = Number(level[0]);
        const amount = Number(level[1]);
        return { price, amount };
    }
}
exports.BinanceBookChangeMapper = BinanceBookChangeMapper;
class BinanceFuturesBookChangeMapper extends BinanceBookChangeMapper {
    constructor(exchange, ignoreBookSnapshotOverlapError) {
        super(exchange, ignoreBookSnapshotOverlapError);
        this.exchange = exchange;
        this.ignoreBookSnapshotOverlapError = ignoreBookSnapshotOverlapError;
    }
    mapBookDepthUpdate(binanceDepthUpdateData, localTimestamp) {
        // we can safely assume here that depthContext and lastUpdateId aren't null here as this is method only works
        // when we've already processed the snapshot
        const depthContext = this.symbolToDepthInfoMapping[binanceDepthUpdateData.s];
        const lastUpdateId = depthContext.lastUpdateId;
        // based on https://binanceapitest.github.io/Binance-Futures-API-doc/wss/#how-to-manage-a-local-order-book-correctly
        // Drop any event where u is < lastUpdateId in the snapshot
        if (binanceDepthUpdateData.u < lastUpdateId) {
            return;
        }
        // The first processed should have U <= lastUpdateId AND u >= lastUpdateId
        if (!depthContext.validatedFirstUpdate) {
            if (binanceDepthUpdateData.U <= lastUpdateId && binanceDepthUpdateData.u >= lastUpdateId) {
                depthContext.validatedFirstUpdate = true;
            }
            else {
                const message = `Book depth snaphot has no overlap with first update, update ${JSON.stringify(binanceDepthUpdateData)}, lastUpdateId: ${lastUpdateId}, exchange ${this.exchange}`;
                if (this.ignoreBookSnapshotOverlapError) {
                    depthContext.validatedFirstUpdate = true;
                    debug_1.debug(message);
                }
                else {
                    throw new Error(message);
                }
            }
        }
        return {
            type: 'book_change',
            symbol: binanceDepthUpdateData.s,
            exchange: this.exchange,
            isSnapshot: false,
            bids: binanceDepthUpdateData.b.map(this.mapBookLevel),
            asks: binanceDepthUpdateData.a.map(this.mapBookLevel),
            timestamp: new Date(binanceDepthUpdateData.T),
            localTimestamp: localTimestamp
        };
    }
}
exports.BinanceFuturesBookChangeMapper = BinanceFuturesBookChangeMapper;
class BinanceFuturesDerivativeTickerMapper {
    constructor(exchange) {
        this.exchange = exchange;
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
        this._indexPrices = new Map();
    }
    canHandle(message) {
        if (message.stream === undefined) {
            return false;
        }
        return (message.stream.includes('@markPrice') ||
            message.stream.endsWith('@ticker') ||
            message.stream.endsWith('@openInterest') ||
            message.stream.includes('@indexPrice'));
    }
    getFilters(symbols) {
        symbols = lowerCaseSymbols(symbols);
        const filters = [
            {
                channel: 'markPrice',
                symbols
            },
            {
                channel: 'ticker',
                symbols
            },
            {
                channel: 'openInterest',
                symbols
            }
        ];
        if (this.exchange === 'binance-delivery') {
            // index channel requires index symbol
            filters.push({
                channel: 'indexPrice',
                symbols: symbols !== undefined ? symbols.map((s) => s.split('_')[0]) : undefined
            });
        }
        return filters;
    }
    *map(message, localTimestamp) {
        if (message.data.e === 'indexPriceUpdate') {
            this._indexPrices.set(message.data.i, Number(message.data.p));
        }
        else {
            const symbol = 's' in message.data ? message.data.s : message.data.symbol;
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(symbol, this.exchange);
            const lastIndexPrice = this._indexPrices.get(symbol.split('_')[0]);
            if (lastIndexPrice !== undefined) {
                pendingTickerInfo.updateIndexPrice(lastIndexPrice);
            }
            if (message.data.e === 'markPriceUpdate') {
                if ('r' in message.data && message.data.r !== '' && message.data.T !== 0) {
                    // only perpetual futures have funding rate info in mark price
                    // delivery futures sometimes send empty ('') r value
                    pendingTickerInfo.updateFundingRate(Number(message.data.r));
                    pendingTickerInfo.updateFundingTimestamp(new Date(message.data.T));
                }
                if (message.data.i !== undefined) {
                    pendingTickerInfo.updateIndexPrice(Number(message.data.i));
                }
                pendingTickerInfo.updateMarkPrice(Number(message.data.p));
                pendingTickerInfo.updateTimestamp(new Date(message.data.E));
            }
            if (message.data.e === '24hrTicker') {
                pendingTickerInfo.updateLastPrice(Number(message.data.c));
                pendingTickerInfo.updateTimestamp(new Date(message.data.E));
            }
            if ('openInterest' in message.data) {
                pendingTickerInfo.updateOpenInterest(Number(message.data.openInterest));
            }
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
    }
}
exports.BinanceFuturesDerivativeTickerMapper = BinanceFuturesDerivativeTickerMapper;
class BinanceLiquidationsMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.stream === undefined) {
            return false;
        }
        return message.stream.endsWith('@forceOrder');
    }
    getFilters(symbols) {
        symbols = lowerCaseSymbols(symbols);
        return [
            {
                channel: 'forceOrder',
                symbols
            }
        ];
    }
    *map(binanceTradeResponse, localTimestamp) {
        const binanceLiquidation = binanceTradeResponse.data.o;
        // not sure if order status can be different to 'FILLED' for liquidations in practice, but...
        if (binanceLiquidation.X !== 'FILLED') {
            return;
        }
        const liquidation = {
            type: 'liquidation',
            symbol: binanceLiquidation.s,
            exchange: this._exchange,
            id: undefined,
            price: Number(binanceLiquidation.ap),
            amount: Number(binanceLiquidation.z),
            side: binanceLiquidation.S === 'SELL' ? 'sell' : 'buy',
            timestamp: new Date(binanceLiquidation.T),
            localTimestamp: localTimestamp
        };
        yield liquidation;
    }
}
exports.BinanceLiquidationsMapper = BinanceLiquidationsMapper;
function lowerCaseSymbols(symbols) {
    if (symbols !== undefined) {
        return symbols.map((s) => s.toLowerCase());
    }
    return;
}
//# sourceMappingURL=binance.js.map