import { Mapper } from './mapper';
import { Trade, BookChange, DerivativeTicker } from '../types';
export declare const phemexTradesMapper: Mapper<'phemex', Trade>;
export declare const phemexBookChangeMapper: Mapper<'phemex', BookChange>;
export declare class PhemexDerivativeTickerMapper implements Mapper<'phemex', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: PhemexTicker): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "market24h";
        readonly symbols: string[] | undefined;
    }[];
    map(message: PhemexTicker, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
declare type PhemexTicker = {
    market24h: {
        fundingRate: number;
        indexPrice: number;
        markPrice: number;
        openInterest: number;
        predFundingRate: number;
        symbol: string;
        close: number;
    };
    timestamp: number;
};
export {};
//# sourceMappingURL=phemex.d.ts.map