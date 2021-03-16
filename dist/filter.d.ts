import { NormalizedData, Disconnect, Trade } from './types';
export declare function filter<T extends NormalizedData | Disconnect>(messages: AsyncIterableIterator<T>, filter: (message: T) => boolean): AsyncGenerator<T, void, unknown>;
export declare function uniqueTradesOnly<T extends NormalizedData | Disconnect>({ maxWindow, onDuplicateFound, skipStaleOlderThanSeconds }?: {
    maxWindow: number;
    skipStaleOlderThanSeconds?: number;
    onDuplicateFound?: (trade: Trade) => void;
}): (message: T) => boolean;
//# sourceMappingURL=filter.d.ts.map