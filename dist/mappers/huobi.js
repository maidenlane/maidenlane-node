"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiLiquidationsMapper = exports.HuobiDerivativeTickerMapper = exports.HuobiMBPBookChangeMapper = exports.HuobiBookChangeMapper = exports.HuobiTradesMapper = void 0;
const mapper_1 = require("./mapper");
const handy_1 = require("../handy");
// https://huobiapi.github.io/docs/spot/v1/en/#websocket-market-data
// https://github.com/huobiapi/API_Docs_en/wiki/WS_api_reference_en
class HuobiTradesMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this._seenSymbols = new Set();
    }
    canHandle(message) {
        if (message.ch === undefined) {
            return false;
        }
        return message.ch.endsWith('.trade.detail');
    }
    getFilters(symbols) {
        symbols = normalizeSymbols(symbols);
        return [
            {
                channel: 'trade',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const symbol = message.ch.split('.')[1].toUpperCase();
        // always ignore first returned trade as it's a 'stale' trade, which has already been published before disconnect
        if (this._seenSymbols.has(symbol) === false) {
            this._seenSymbols.add(symbol);
            return;
        }
        for (const huobiTrade of message.tick.data) {
            yield {
                type: 'trade',
                symbol,
                exchange: this._exchange,
                id: String(huobiTrade.tradeId !== undefined ? huobiTrade.tradeId : huobiTrade.id),
                price: huobiTrade.price,
                amount: huobiTrade.amount,
                side: huobiTrade.direction,
                timestamp: new Date(huobiTrade.ts),
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.HuobiTradesMapper = HuobiTradesMapper;
class HuobiBookChangeMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
    }
    canHandle(message) {
        if (message.ch === undefined) {
            return false;
        }
        return message.ch.includes('.depth.');
    }
    getFilters(symbols) {
        symbols = normalizeSymbols(symbols);
        return [
            {
                channel: 'depth',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const symbol = message.ch.split('.')[1].toUpperCase();
        const isSnapshot = 'event' in message.tick ? message.tick.event === 'snapshot' : 'update' in message ? false : true;
        const data = message.tick;
        const bids = Array.isArray(data.bids) ? data.bids : [];
        const asks = Array.isArray(data.asks) ? data.asks : [];
        if (bids.length === 0 && asks.length === 0) {
            return;
        }
        yield {
            type: 'book_change',
            symbol,
            exchange: this._exchange,
            isSnapshot,
            bids: bids.map(this._mapBookLevel),
            asks: asks.map(this._mapBookLevel),
            timestamp: new Date(message.ts),
            localTimestamp: localTimestamp
        };
    }
    _mapBookLevel(level) {
        return { price: level[0], amount: level[1] };
    }
}
exports.HuobiBookChangeMapper = HuobiBookChangeMapper;
function isSnapshot(message) {
    return 'rep' in message;
}
class HuobiMBPBookChangeMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this.symbolToMBPInfoMapping = {};
    }
    canHandle(message) {
        const channel = message.ch || message.rep;
        if (channel === undefined) {
            return false;
        }
        return channel.includes('.mbp.');
    }
    getFilters(symbols) {
        symbols = normalizeSymbols(symbols);
        return [
            {
                channel: 'mbp',
                symbols
            }
        ];
    }
    *map(message, localTimestamp) {
        const symbol = (isSnapshot(message) ? message.rep : message.ch).split('.')[1].toUpperCase();
        if (this.symbolToMBPInfoMapping[symbol] === undefined) {
            this.symbolToMBPInfoMapping[symbol] = {
                bufferedUpdates: new handy_1.CircularBuffer(20)
            };
        }
        const mbpInfo = this.symbolToMBPInfoMapping[symbol];
        const snapshotAlreadyProcessed = mbpInfo.snapshotProcessed;
        if (isSnapshot(message)) {
            const snapshotBids = message.data.bids.map(this._mapBookLevel);
            const snapshotAsks = message.data.asks.map(this._mapBookLevel);
            // if there were any depth updates buffered, let's proccess those by adding to or updating the initial snapshot
            // when prevSeqNum >= snapshot seqNum
            for (const update of mbpInfo.bufferedUpdates.items()) {
                if (update.tick.prevSeqNum < message.data.seqNum) {
                    continue;
                }
                const bookChange = this._mapMBPUpdate(update, symbol, localTimestamp);
                if (bookChange !== undefined) {
                    for (const bid of bookChange.bids) {
                        const matchingBid = snapshotBids.find((b) => b.price === bid.price);
                        if (matchingBid !== undefined) {
                            matchingBid.amount = bid.amount;
                        }
                        else {
                            snapshotBids.push(bid);
                        }
                    }
                    for (const ask of bookChange.asks) {
                        const matchingAsk = snapshotAsks.find((a) => a.price === ask.price);
                        if (matchingAsk !== undefined) {
                            matchingAsk.amount = ask.amount;
                        }
                        else {
                            snapshotAsks.push(ask);
                        }
                    }
                }
            }
            mbpInfo.snapshotProcessed = true;
            yield {
                type: 'book_change',
                symbol,
                exchange: this._exchange,
                isSnapshot: true,
                bids: snapshotBids,
                asks: snapshotAsks,
                timestamp: new Date(message.ts),
                localTimestamp
            };
        }
        else {
            mbpInfo.bufferedUpdates.append(message);
            if (snapshotAlreadyProcessed) {
                // snapshot was already processed let's map the mbp message as normal book_change
                const update = this._mapMBPUpdate(message, symbol, localTimestamp);
                if (update !== undefined) {
                    yield update;
                }
            }
        }
    }
    _mapMBPUpdate(message, symbol, localTimestamp) {
        const bids = Array.isArray(message.tick.bids) ? message.tick.bids : [];
        const asks = Array.isArray(message.tick.asks) ? message.tick.asks : [];
        if (bids.length === 0 && asks.length === 0) {
            return;
        }
        return {
            type: 'book_change',
            symbol,
            exchange: this._exchange,
            isSnapshot: false,
            bids: bids.map(this._mapBookLevel),
            asks: asks.map(this._mapBookLevel),
            timestamp: new Date(message.ts),
            localTimestamp: localTimestamp
        };
    }
    _mapBookLevel(level) {
        return { price: level[0], amount: level[1] };
    }
}
exports.HuobiMBPBookChangeMapper = HuobiMBPBookChangeMapper;
function normalizeSymbols(symbols) {
    if (symbols !== undefined) {
        return symbols.map((s) => {
            // huobi-dm and huobi-dm-swap expect symbols to be upper cased
            if (s.includes('_') || s.includes('-')) {
                return s;
            }
            // huobi global expects lower cased symbols
            return s.toLowerCase();
        });
    }
    return;
}
class HuobiDerivativeTickerMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this.pendingTickerInfoHelper = new mapper_1.PendingTickerInfoHelper();
    }
    canHandle(message) {
        if (message.ch !== undefined) {
            return message.ch.includes('.basis.') || message.ch.endsWith('.open_interest');
        }
        if (message.op === 'notify' && message.topic !== undefined) {
            return message.topic.endsWith('.funding_rate');
        }
        return false;
    }
    getFilters(symbols) {
        const filters = [
            {
                channel: 'basis',
                symbols
            },
            {
                channel: 'open_interest',
                symbols
            }
        ];
        if (this._exchange === 'huobi-dm-swap' || this._exchange === 'huobi-dm-linear-swap') {
            filters.push({
                channel: 'funding_rate',
                symbols
            });
        }
        return filters;
    }
    *map(message, localTimestamp) {
        if ('op' in message) {
            // handle funding_rate notification message
            const fundingInfo = message.data[0];
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(fundingInfo.contract_code, this._exchange);
            pendingTickerInfo.updateFundingRate(Number(fundingInfo.funding_rate));
            pendingTickerInfo.updateFundingTimestamp(new Date(Number(fundingInfo.settlement_time)));
            pendingTickerInfo.updatePredictedFundingRate(Number(fundingInfo.estimated_rate));
            pendingTickerInfo.updateTimestamp(new Date(message.ts));
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
        else {
            const symbol = message.ch.split('.')[1];
            const pendingTickerInfo = this.pendingTickerInfoHelper.getPendingTickerInfo(symbol, this._exchange);
            // basis message
            if ('tick' in message) {
                pendingTickerInfo.updateIndexPrice(Number(message.tick.index_price));
                pendingTickerInfo.updateLastPrice(Number(message.tick.contract_price));
            }
            else {
                // open interest message
                const openInterest = message.data[0];
                pendingTickerInfo.updateOpenInterest(Number(openInterest.volume));
            }
            pendingTickerInfo.updateTimestamp(new Date(message.ts));
            if (pendingTickerInfo.hasChanged()) {
                yield pendingTickerInfo.getSnapshot(localTimestamp);
            }
        }
    }
}
exports.HuobiDerivativeTickerMapper = HuobiDerivativeTickerMapper;
class HuobiLiquidationsMapper {
    constructor(_exchange) {
        this._exchange = _exchange;
        this._contractCodeToSymbolMap = new Map();
        this._contractTypesSuffixes = { this_week: 'CW', next_week: 'NW', quarter: 'CQ', next_quarter: 'NQ' };
    }
    canHandle(message) {
        if (message.op !== 'notify') {
            return false;
        }
        if (this._exchange === 'huobi-dm' && message.topic.endsWith('.contract_info')) {
            this._updateContractCodeToSymbolMap(message);
        }
        return message.topic.endsWith('.liquidation_orders');
    }
    getFilters(symbols) {
        if (this._exchange === 'huobi-dm') {
            // huobi-dm for liquidations requires prividing different symbols which are indexes names for example 'BTC' or 'ETH'
            // not futures names like 'BTC_NW'
            // see https://huobiapi.github.io/docs/dm/v1/en/#subscribe-liquidation-order-data-no-authentication-sub
            if (symbols !== undefined) {
                symbols = symbols.map((s) => s.split('_')[0]);
            }
            // we also need to subscribe to contract_info which will provide us information that will allow us to map
            // liquidation message symbol and contract code to symbols we expect (BTC_NW etc)
            return [
                {
                    channel: 'liquidation_orders',
                    symbols
                },
                {
                    channel: 'contract_info',
                    symbols
                }
            ];
        }
        else {
            // huobi dm swap liquidations messages provide correct symbol & contract code
            return [
                {
                    channel: 'liquidation_orders',
                    symbols
                }
            ];
        }
    }
    _updateContractCodeToSymbolMap(message) {
        for (const item of message.data) {
            this._contractCodeToSymbolMap.set(item.contract_code, `${item.symbol}_${this._contractTypesSuffixes[item.contract_type]}`);
        }
    }
    *map(message, localTimestamp) {
        for (const huobiLiquidation of message.data) {
            let symbol = huobiLiquidation.contract_code;
            // huobi-dm returns index name as a symbol, not future alias, so we need to map it here
            if (this._exchange === 'huobi-dm') {
                const futureAliasSymbol = this._contractCodeToSymbolMap.get(huobiLiquidation.contract_code);
                if (futureAliasSymbol === undefined) {
                    continue;
                }
                symbol = futureAliasSymbol;
            }
            yield {
                type: 'liquidation',
                symbol,
                exchange: this._exchange,
                id: undefined,
                price: huobiLiquidation.price,
                amount: huobiLiquidation.volume,
                side: huobiLiquidation.direction,
                timestamp: new Date(huobiLiquidation.created_at),
                localTimestamp: localTimestamp
            };
        }
    }
}
exports.HuobiLiquidationsMapper = HuobiLiquidationsMapper;
//# sourceMappingURL=huobi.js.map