import { BookChange, DerivativeTicker, FilterForExchange, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
export declare const bitmexTradesMapper: Mapper<'bitmex', Trade>;
export declare class BitmexBookChangeMapper implements Mapper<'bitmex', BookChange> {
    private readonly _idToPriceLevelMap;
    canHandle(message: BitmexDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "orderBookL2";
        readonly symbols: string[] | undefined;
    }[];
    map(bitmexOrderBookL2Message: BitmexOrderBookL2Message, localTimestamp: Date): IterableIterator<BookChange>;
}
export declare class BitmexDerivativeTickerMapper implements Mapper<'bitmex', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: BitmexDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "instrument";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BitmexInstrumentsMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare const bitmexLiquidationsMapper: Mapper<'bitmex', Liquidation>;
declare type BitmexDataMessage = {
    table: FilterForExchange['bitmex']['channel'];
    action: 'partial' | 'update' | 'insert' | 'delete';
};
declare type BitmexInstrument = {
    symbol: string;
    state?: 'Open' | 'Closed' | 'Unlisted' | 'Settled';
    openInterest?: number | null;
    fundingRate?: number | null;
    markPrice?: number | null;
    lastPrice?: number | null;
    indicativeSettlePrice?: number | null;
    indicativeFundingRate?: number | null;
    fundingTimestamp?: string | null;
    timestamp?: string;
};
declare type BitmexInstrumentsMessage = BitmexDataMessage & {
    table: 'instrument';
    data: BitmexInstrument[];
};
declare type BitmexOrderBookL2Message = BitmexDataMessage & {
    table: 'orderBookL2';
    data: {
        symbol: string;
        id: number;
        side: 'Buy' | 'Sell';
        size?: number;
        price?: number;
    }[];
};
export {};
//# sourceMappingURL=bitmex.d.ts.map