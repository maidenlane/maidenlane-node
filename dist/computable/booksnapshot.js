"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBookSnapshots = void 0;
const handy_1 = require("../handy");
const orderbook_1 = require("../orderbook");
const computeBookSnapshots = (options) => () => new BookSnapshotComputable(options);
exports.computeBookSnapshots = computeBookSnapshots;
const emptyBookLevel = {
    price: undefined,
    amount: undefined
};
const levelsChanged = (level1, level2) => {
    if (level1.amount !== level2.amount) {
        return true;
    }
    if (level1.price !== level2.price) {
        return true;
    }
    return false;
};
class BookSnapshotComputable {
    constructor({ depth, name, interval, removeCrossedLevels, grouping, onCrossedLevelRemoved }) {
        this.sourceDataTypes = ['book_change'];
        this._bookChanged = false;
        this._type = 'book_snapshot';
        this._lastUpdateTimestamp = new Date(-1);
        this._bids = [];
        this._asks = [];
        this._getGroupedPriceForBids = (price) => {
            const pow = Math.pow(10, this._groupingDecimalPlaces);
            const pricePow = price * pow;
            const groupPow = this._grouping * pow;
            const remainder = (pricePow % groupPow) / pow;
            return (pricePow - remainder * pow) / pow;
        };
        this._getGroupedPriceForAsks = (price) => {
            const pow = Math.pow(10, this._groupingDecimalPlaces);
            const pricePow = price * pow;
            const groupPow = this._grouping * pow;
            const remainder = (pricePow % groupPow) / pow;
            return (pricePow - remainder * pow + (remainder > 0 ? groupPow : 0)) / pow;
        };
        this._depth = depth;
        this._interval = interval;
        this._grouping = grouping;
        this._groupingDecimalPlaces = this._grouping ? handy_1.decimalPlaces(this._grouping) : undefined;
        this._orderBook = new orderbook_1.OrderBook({
            removeCrossedLevels,
            onCrossedLevelRemoved
        });
        // initialize all bids/asks levels to empty ones
        for (let i = 0; i < this._depth; i++) {
            this._bids[i] = emptyBookLevel;
            this._asks[i] = emptyBookLevel;
        }
        if (name === undefined) {
            this._name = `${this._type}_${depth}${this._grouping ? `_grouped${this._grouping}` : ''}_${interval}ms`;
        }
        else {
            this._name = name;
        }
    }
    *compute(bookChange) {
        if (this._hasNewSnapshot(bookChange.timestamp)) {
            yield this._getSnapshot(bookChange);
        }
        this._update(bookChange);
        // check again after the update as book snapshot with interval set to 0 (real-time) could have changed
        if (this._hasNewSnapshot(bookChange.timestamp)) {
            yield this._getSnapshot(bookChange);
        }
    }
    _hasNewSnapshot(timestamp) {
        if (this._bookChanged === false) {
            return false;
        }
        // report new snapshot anytime book changed
        if (this._interval === 0) {
            return true;
        }
        const currentTimestampTimeBucket = this._getTimeBucket(timestamp);
        const snapshotTimestampBucket = this._getTimeBucket(this._lastUpdateTimestamp);
        if (currentTimestampTimeBucket > snapshotTimestampBucket) {
            // set  timestamp to end of snapshot 'interval' period
            this._lastUpdateTimestamp = new Date((snapshotTimestampBucket + 1) * this._interval);
            return true;
        }
        return false;
    }
    _update(bookChange) {
        this._orderBook.update(bookChange);
        if (this._grouping !== undefined) {
            this._updateSideGrouped(this._orderBook.bids(), this._bids, this._getGroupedPriceForBids);
            this._updateSideGrouped(this._orderBook.asks(), this._asks, this._getGroupedPriceForAsks);
        }
        else {
            this._updatedNotGrouped();
        }
        this._lastUpdateTimestamp = bookChange.timestamp;
    }
    _updatedNotGrouped() {
        const bidsIterable = this._orderBook.bids();
        const asksIterable = this._orderBook.asks();
        for (let i = 0; i < this._depth; i++) {
            const bidLevelResult = bidsIterable.next();
            const newBid = bidLevelResult.done ? emptyBookLevel : bidLevelResult.value;
            if (levelsChanged(this._bids[i], newBid)) {
                this._bids[i] = { ...newBid };
                this._bookChanged = true;
            }
            const askLevelResult = asksIterable.next();
            const newAsk = askLevelResult.done ? emptyBookLevel : askLevelResult.value;
            if (levelsChanged(this._asks[i], newAsk)) {
                this._asks[i] = { ...newAsk };
                this._bookChanged = true;
            }
        }
    }
    _updateSideGrouped(newLevels, existingGroupedLevels, getGroupedPriceForLevel) {
        let currentGroupedPrice = undefined;
        let aggAmount = 0;
        let currentDepth = 0;
        for (const notGroupedLevel of newLevels) {
            const groupedPrice = getGroupedPriceForLevel(notGroupedLevel.price);
            if (currentGroupedPrice == undefined) {
                currentGroupedPrice = groupedPrice;
            }
            if (currentGroupedPrice != groupedPrice) {
                const groupedLevel = {
                    price: currentGroupedPrice,
                    amount: aggAmount
                };
                if (levelsChanged(existingGroupedLevels[currentDepth], groupedLevel)) {
                    existingGroupedLevels[currentDepth] = groupedLevel;
                    this._bookChanged = true;
                }
                currentDepth++;
                if (currentDepth === this._depth) {
                    break;
                }
                currentGroupedPrice = groupedPrice;
                aggAmount = 0;
            }
            aggAmount += notGroupedLevel.amount;
        }
        if (currentDepth < this._depth && aggAmount > 0) {
            const groupedLevel = {
                price: currentGroupedPrice,
                amount: aggAmount
            };
            if (levelsChanged(existingGroupedLevels[currentDepth], groupedLevel)) {
                existingGroupedLevels[currentDepth] = groupedLevel;
                this._bookChanged = true;
            }
        }
    }
    _getSnapshot(bookChange) {
        const snapshot = {
            type: this._type,
            symbol: bookChange.symbol,
            exchange: bookChange.exchange,
            name: this._name,
            depth: this._depth,
            interval: this._interval,
            grouping: this._grouping,
            bids: [...this._bids],
            asks: [...this._asks],
            timestamp: this._lastUpdateTimestamp,
            localTimestamp: bookChange.localTimestamp
        };
        this._bookChanged = false;
        return snapshot;
    }
    _getTimeBucket(timestamp) {
        return Math.floor(timestamp.valueOf() / this._interval);
    }
}
//# sourceMappingURL=booksnapshot.js.map