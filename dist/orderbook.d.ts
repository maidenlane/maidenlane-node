import { BookChange, BookPriceLevel } from './types';
export declare type OnLevelRemovedCB = (bookChange: BookChange, bestBidBeforeRemoval: BookPriceLevel | undefined, bestBidAfterRemoval: BookPriceLevel | undefined, bestAskBeforeRemoval: BookPriceLevel | undefined, bestAskAfterRemoval: BookPriceLevel | undefined) => void;
export declare class OrderBook {
    private readonly _bids;
    private readonly _asks;
    private readonly _removeCrossedLevels;
    private readonly _onCrossedLevelRemoved;
    private _receivedInitialSnapshot;
    constructor({ removeCrossedLevels, onCrossedLevelRemoved }?: {
        removeCrossedLevels?: boolean;
        onCrossedLevelRemoved?: OnLevelRemovedCB;
    });
    update(bookChange: BookChange): void;
    bestBid(): BookPriceLevel | undefined;
    bestAsk(): BookPriceLevel | undefined;
    private _removeCrossedLevelsIfNeeded;
    private _removeBestAsk;
    private _removeBestBid;
    bids(): IterableIterator<BookPriceLevel>;
    asks(): IterableIterator<BookPriceLevel>;
}
//# sourceMappingURL=orderbook.d.ts.map