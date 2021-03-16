import { Mapper } from './mapper';
import { Trade, BookChange, DerivativeTicker } from '../types';
export declare class DeltaTradesMapper implements Mapper<'delta', Trade> {
    private _useV2Channels;
    constructor(_useV2Channels: boolean);
    canHandle(message: DeltaTrade): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "recent_trade" | "all_trades";
        readonly symbols: string[] | undefined;
    }[];
    map(message: DeltaTrade, localTimestamp: Date): IterableIterator<Trade>;
}
export declare const deltaBookChangeMapper: Mapper<'delta', BookChange>;
export declare class DeltaDerivativeTickerMapper implements Mapper<'delta', DerivativeTicker> {
    private _useV2Channels;
    constructor(_useV2Channels: boolean);
    private readonly pendingTickerInfoHelper;
    canHandle(message: DeltaTrade | DeltaMarkPrice | DeltaFundingRate): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "recent_trade" | "all_trades";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "funding_rate";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "mark_price";
        readonly symbols: string[] | undefined;
    })[];
    map(message: DeltaTrade | DeltaMarkPrice | DeltaFundingRate, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
declare type DeltaTrade = {
    buyer_role: 'taker' | 'maker';
    price: string;
    size: number;
    symbol: string;
    timestamp: number;
    type: 'recent_trade' | 'all_trades';
};
declare type DeltaMarkPrice = {
    price: string;
    symbol: string;
    timestamp: number;
    type: 'mark_price';
};
declare type DeltaFundingRate = {
    funding_rate?: string | number;
    next_funding_realization?: number;
    predicted_funding_rate?: number;
    symbol: string;
    timestamp: number;
    type: 'funding_rate';
};
export {};
//# sourceMappingURL=delta.d.ts.map