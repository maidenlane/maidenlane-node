"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBook = void 0;
const bintrees_1 = require("bintrees");
class OrderBook {
    constructor({ removeCrossedLevels, onCrossedLevelRemoved } = {}) {
        this._bids = new bintrees_1.RBTree((nodeA, nodeB) => nodeB.price - nodeA.price);
        this._asks = new bintrees_1.RBTree((nodeA, nodeB) => nodeA.price - nodeB.price);
        this._receivedInitialSnapshot = false;
        this._removeCrossedLevels = removeCrossedLevels;
        this._onCrossedLevelRemoved = onCrossedLevelRemoved;
    }
    update(bookChange) {
        // clear everything up, when snapshot received so we don't have stale levels by accident
        if (bookChange.isSnapshot) {
            this._bids.clear();
            this._asks.clear();
            this._receivedInitialSnapshot = true;
        }
        // process updates as long as we've received initial snapshot, otherwise ignore such messages
        if (this._receivedInitialSnapshot) {
            applyPriceLevelChanges(this._asks, bookChange.asks);
            applyPriceLevelChanges(this._bids, bookChange.bids);
        }
        if (this._removeCrossedLevels) {
            this._removeCrossedLevelsIfNeeded(bookChange);
        }
    }
    bestBid() {
        const result = this.bids().next();
        if (result.done === false) {
            return result.value;
        }
        return undefined;
    }
    bestAsk() {
        const result = this.asks().next();
        if (result.done === false) {
            return result.value;
        }
        return undefined;
    }
    _removeCrossedLevelsIfNeeded(bookChange) {
        let bestBid = this.bestBid();
        let bestAsk = this.bestAsk();
        let bookIsCrossed = bestBid !== undefined && bestAsk !== undefined && bestBid.price >= bestAsk.price;
        // if after update we have crossed order book (best bid >= best ask)
        // it most likely means that exchange has not published delete message for the other side of the book
        // more info:
        // https://www.reddit.com/r/KrakenSupport/comments/d1a4nx/websocket_orderbook_receiving_wrong_bid_price_for/
        // https://www.reddit.com/r/BitMEX/comments/8lbj9e/bidask_ledger_weirdness/
        // https://twitter.com/coinarb/status/931260529993170944
        if (bookIsCrossed) {
            // decide from which side of the book we should remove level so book isn't crossed anymore
            // if current book update updated "best ask" it means we should remove "best bid" as exchange hasn't provided book change update
            // that deletes it, and vice versa for for "best bids"
            const shouldRemoveBestBid = bookChange.asks.some((s) => s.price === bestAsk.price);
            while (bookIsCrossed) {
                if (shouldRemoveBestBid) {
                    this._removeBestBid();
                }
                else {
                    this._removeBestAsk();
                }
                const newBestBid = this.bestBid();
                const newBestAsk = this.bestAsk();
                if (this._onCrossedLevelRemoved !== undefined) {
                    this._onCrossedLevelRemoved(bookChange, bestBid, newBestBid, bestAsk, newBestAsk);
                }
                bestBid = newBestBid;
                bestAsk = newBestAsk;
                bookIsCrossed = bestBid !== undefined && bestAsk !== undefined && bestBid.price >= bestAsk.price;
            }
        }
    }
    _removeBestAsk() {
        const bestAsk = this.bestAsk();
        if (bestAsk !== undefined) {
            applyPriceLevelChanges(this._asks, [
                {
                    price: bestAsk.price,
                    amount: 0
                }
            ]);
        }
    }
    _removeBestBid() {
        const bestBid = this.bestBid();
        if (bestBid !== undefined) {
            applyPriceLevelChanges(this._bids, [
                {
                    price: bestBid.price,
                    amount: 0
                }
            ]);
        }
    }
    *bids() {
        const iterator = this._bids.iterator();
        let level = iterator.next();
        while (level !== null) {
            yield level;
            level = iterator.next();
        }
    }
    *asks() {
        const iterator = this._asks.iterator();
        let level = iterator.next();
        while (level !== null) {
            yield level;
            level = iterator.next();
        }
    }
}
exports.OrderBook = OrderBook;
function applyPriceLevelChanges(tree, priceLevelChanges) {
    for (const priceLevel of priceLevelChanges) {
        const node = tree.find(priceLevel);
        const nodeExists = node !== null;
        const levelShouldBeRemoved = priceLevel.amount === 0;
        if (nodeExists && levelShouldBeRemoved) {
            tree.remove(priceLevel);
        }
        else if (nodeExists) {
            node.amount = priceLevel.amount;
        }
        else if (levelShouldBeRemoved === false) {
            tree.insert({ ...priceLevel });
        }
    }
}
//# sourceMappingURL=orderbook.js.map