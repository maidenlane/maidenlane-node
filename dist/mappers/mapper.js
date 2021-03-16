"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingTickerInfoHelper = void 0;
const isNullOrUndefined = (input) => input === undefined || input === null;
class PendingTickerInfoHelper {
    constructor() {
        this._pendingTickers = new Map();
    }
    getPendingTickerInfo(symbol, exchange) {
        let pendingTickerInfo = this._pendingTickers.get(symbol);
        if (pendingTickerInfo === undefined) {
            pendingTickerInfo = new PendingDerivativeTickerInfo(symbol, exchange);
            this._pendingTickers.set(symbol, pendingTickerInfo);
        }
        return pendingTickerInfo;
    }
    hasPendingTickerInfo(symbol) {
        return this._pendingTickers.has(symbol);
    }
}
exports.PendingTickerInfoHelper = PendingTickerInfoHelper;
class PendingDerivativeTickerInfo {
    constructor(symbol, exchange) {
        this._pendingTicker = {
            type: 'derivative_ticker',
            symbol,
            exchange,
            lastPrice: undefined,
            openInterest: undefined,
            fundingRate: undefined,
            fundingTimestamp: undefined,
            predictedFundingRate: undefined,
            indexPrice: undefined,
            markPrice: undefined,
            timestamp: undefined,
            localTimestamp: new Date()
        };
        this._hasChanged = false;
    }
    updateOpenInterest(openInterest) {
        if (isNullOrUndefined(openInterest)) {
            return;
        }
        if (this._pendingTicker.openInterest !== openInterest) {
            this._pendingTicker.openInterest = openInterest;
            this._hasChanged = true;
        }
    }
    updateMarkPrice(markPrice) {
        if (isNullOrUndefined(markPrice)) {
            return;
        }
        if (this._pendingTicker.markPrice !== markPrice) {
            this._pendingTicker.markPrice = markPrice;
            this._hasChanged = true;
        }
    }
    updateFundingRate(fundingRate) {
        if (isNullOrUndefined(fundingRate)) {
            return;
        }
        if (this._pendingTicker.fundingRate !== fundingRate) {
            this._pendingTicker.fundingRate = fundingRate;
            this._hasChanged = true;
        }
    }
    updatePredictedFundingRate(predictedFundingRate) {
        if (isNullOrUndefined(predictedFundingRate)) {
            return;
        }
        if (this._pendingTicker.predictedFundingRate !== predictedFundingRate) {
            this._pendingTicker.predictedFundingRate = predictedFundingRate;
            this._hasChanged = true;
        }
    }
    updateFundingTimestamp(fundingTimestamp) {
        if (isNullOrUndefined(fundingTimestamp)) {
            return;
        }
        if (this._pendingTicker.fundingTimestamp === undefined ||
            this._pendingTicker.fundingTimestamp.valueOf() !== fundingTimestamp.valueOf()) {
            this._pendingTicker.fundingTimestamp = fundingTimestamp;
            this._hasChanged = true;
        }
    }
    updateIndexPrice(indexPrice) {
        if (isNullOrUndefined(indexPrice)) {
            return;
        }
        if (this._pendingTicker.indexPrice !== indexPrice) {
            this._pendingTicker.indexPrice = indexPrice;
            this._hasChanged = true;
        }
    }
    updateLastPrice(lastPrice) {
        if (isNullOrUndefined(lastPrice)) {
            return;
        }
        if (this._pendingTicker.lastPrice !== lastPrice) {
            this._pendingTicker.lastPrice = lastPrice;
            this._hasChanged = true;
        }
    }
    updateTimestamp(timestamp) {
        if (this._pendingTicker.timestamp === undefined || this._pendingTicker.timestamp.valueOf() <= timestamp.valueOf()) {
            this._pendingTicker.timestamp = timestamp;
        }
    }
    hasChanged() {
        return this._hasChanged;
    }
    getSnapshot(localTimestamp) {
        this._hasChanged = false;
        this._pendingTicker.localTimestamp = localTimestamp;
        if (this._pendingTicker.timestamp === undefined) {
            this._pendingTicker.timestamp = localTimestamp;
        }
        return { ...this._pendingTicker };
    }
}
//# sourceMappingURL=mapper.js.map