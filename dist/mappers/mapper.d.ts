import { DerivativeTicker, Exchange, FilterForExchange, NormalizedData } from '../types';
export declare type Mapper<T extends Exchange, U extends NormalizedData> = {
    canHandle: (message: any) => boolean;
    map(message: any, localTimestamp: Date): IterableIterator<U> | undefined;
    getFilters: (symbols?: string[]) => FilterForExchange[T][];
};
export declare type MapperFactory<T extends Exchange, U extends NormalizedData> = (exchange: T, localTimestamp: Date) => Mapper<T, U>;
export declare class PendingTickerInfoHelper {
    private readonly _pendingTickers;
    getPendingTickerInfo(symbol: string, exchange: Exchange): PendingDerivativeTickerInfo;
    hasPendingTickerInfo(symbol: string): boolean;
}
declare class PendingDerivativeTickerInfo {
    private _pendingTicker;
    private _hasChanged;
    constructor(symbol: string, exchange: Exchange);
    updateOpenInterest(openInterest: number | undefined | null): void;
    updateMarkPrice(markPrice: number | undefined | null): void;
    updateFundingRate(fundingRate: number | undefined | null): void;
    updatePredictedFundingRate(predictedFundingRate: number | undefined | null): void;
    updateFundingTimestamp(fundingTimestamp: Date | undefined | null): void;
    updateIndexPrice(indexPrice: number | undefined | null): void;
    updateLastPrice(lastPrice: number | undefined | null): void;
    updateTimestamp(timestamp: Date): void;
    hasChanged(): boolean;
    getSnapshot(localTimestamp: Date): DerivativeTicker;
}
export {};
//# sourceMappingURL=mapper.d.ts.map