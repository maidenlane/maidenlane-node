import { BookChange, DerivativeTicker, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
export declare const cryptofacilitiesTradesMapper: Mapper<'cryptofacilities', Trade>;
export declare const cryptofacilitiesBookChangeMapper: Mapper<'cryptofacilities', BookChange>;
export declare class CryptofacilitiesDerivativeTickerMapper implements Mapper<'cryptofacilities', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: CryptofacilitiesTrade | CryptofacilitiesTicker | CryptofacilitiesBookSnapshot | CryptofacilitiesBookUpdate): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "ticker";
        readonly symbols: string[] | undefined;
    }[];
    map(ticker: CryptofacilitiesTicker, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare const cryptofacilitiesLiquidationsMapper: Mapper<'cryptofacilities', Liquidation>;
declare type CryptofacilitiesTrade = {
    feed: 'trade';
    type: 'liquidation' | 'fill';
    uid: string | undefined;
    event: undefined;
    product_id: string;
    side: 'buy' | 'sell';
    time: number;
    qty: number;
    price: number;
};
declare type CryptofacilitiesTicker = {
    feed: 'ticker';
    event: undefined;
    product_id: string;
    index: number;
    last: number;
    openInterest: number;
    markPrice: number;
    funding_rate: number | undefined;
    funding_rate_prediction: number | undefined;
    next_funding_rate_time: number | undefined;
    time: number;
};
declare type CryptofacilitiesBookLevel = {
    price: number;
    qty: number;
};
declare type CryptofacilitiesBookSnapshot = {
    feed: 'book_snapshot';
    event: undefined;
    product_id: string;
    timestamp: number | undefined;
    bids: CryptofacilitiesBookLevel[];
    asks: CryptofacilitiesBookLevel[];
};
declare type CryptofacilitiesBookUpdate = {
    feed: 'book';
    event: undefined;
    product_id: string;
    side: 'buy' | 'sell';
    price: number;
    qty: number;
    timestamp: number | undefined;
};
export {};
//# sourceMappingURL=cryptofacilities.d.ts.map