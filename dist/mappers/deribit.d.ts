import { BookChange, DerivativeTicker, Trade, OptionSummary, Liquidation } from '../types';
import { Mapper } from './mapper';
export declare const deribitTradesMapper: Mapper<'deribit', Trade>;
export declare const deribitBookChangeMapper: Mapper<'deribit', BookChange>;
export declare class DeribitDerivativeTickerMapper implements Mapper<'deribit', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: any): any;
    getFilters(symbols?: string[]): {
        readonly channel: "ticker";
        readonly symbols: string[] | undefined;
    }[];
    map(message: DeribitTickerMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class DeribitOptionSummaryMapper implements Mapper<'deribit', OptionSummary> {
    getFilters(symbols?: string[]): {
        readonly channel: "ticker";
        readonly symbols: string[] | undefined;
    }[];
    canHandle(message: any): any;
    map(message: DeribitOptionTickerMessage, localTimestamp: Date): Generator<OptionSummary, void, unknown>;
}
export declare const deribitLiquidationsMapper: Mapper<'deribit', Liquidation>;
declare type DeribitMessage = {
    params: {
        channel: string;
    };
};
declare type DeribitTickerMessage = DeribitMessage & {
    params: {
        data: {
            timestamp: number;
            open_interest: number;
            last_price: number | null;
            mark_price: number;
            instrument_name: string;
            index_price: number;
            current_funding?: number;
            funding_8h?: number;
        };
    };
};
declare type DeribitOptionTickerMessage = DeribitMessage & {
    params: {
        data: {
            underlying_price: number;
            underlying_index: string;
            timestamp: number;
            open_interest: number;
            mark_price: number;
            mark_iv: number;
            last_price: number | null;
            instrument_name: string;
            greeks: {
                vega: number;
                theta: number;
                rho: number;
                gamma: number;
                delta: number;
            };
            bid_iv: number | undefined;
            best_bid_price: number | undefined;
            best_bid_amount: number | undefined;
            best_ask_price: number | undefined;
            best_ask_amount: number | undefined;
            ask_iv: number | undefined;
        };
    };
};
export {};
//# sourceMappingURL=deribit.d.ts.map