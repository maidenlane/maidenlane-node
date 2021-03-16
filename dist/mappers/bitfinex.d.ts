import { BookChange, DerivativeTicker, Exchange, FilterForExchange, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
export declare class BitfinexTradesMapper implements Mapper<'bitfinex' | 'bitfinex-derivatives', Trade> {
    private readonly _exchange;
    private readonly _channelIdToSymbolMap;
    constructor(_exchange: Exchange);
    canHandle(message: BitfinexMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trades";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BitfinexTrades, localTimestamp: Date): Generator<Trade, void, unknown>;
}
export declare class BitfinexBookChangeMapper implements Mapper<'bitfinex' | 'bitfinex-derivatives', BookChange> {
    private readonly _exchange;
    private readonly _channelIdToSymbolMap;
    constructor(_exchange: Exchange);
    canHandle(message: BitfinexMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "book";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BitfinexBooks, localTimestamp: Date): Generator<BookChange, void, unknown>;
    private _mapBookLevel;
}
export declare class BitfinexDerivativeTickerMapper implements Mapper<'bitfinex-derivatives', DerivativeTicker> {
    private readonly _channelIdToSymbolMap;
    private readonly pendingTickerInfoHelper;
    canHandle(message: BitfinexMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "status";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BitfinexStatusMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class BitfinexLiquidationsMapper implements Mapper<'bitfinex-derivatives', Liquidation> {
    private readonly _exchange;
    private _liquidationsChannelId;
    constructor(_exchange: Exchange);
    canHandle(message: BitfinexMessage): boolean;
    getFilters(): {
        readonly channel: "liquidations";
    }[];
    map(message: BitfinexLiquidation, localTimestamp: Date): Generator<Liquidation, void, unknown>;
}
declare type BitfinexMessage = {
    event: 'subscribed';
    channel: FilterForExchange['bitfinex-derivatives']['channel'];
    chanId: number;
    pair: string;
    prec: string;
    key?: string;
} | Array<any>;
declare type BitfinexHeartbeat = [number, 'hb'];
declare type BitfinexTrades = [number, 'te' | any[], [number, number, number, number]] | BitfinexHeartbeat;
declare type BitfinexBookLevel = [number, number, number];
declare type BitfinexBooks = [number, BitfinexBookLevel | BitfinexBookLevel[], number, number] | BitfinexHeartbeat;
declare type BitfinexStatusMessage = [number, (number | undefined)[], number, number] | BitfinexHeartbeat;
declare type BitfinexLiquidation = [number, ['pos', number, number, null, string, number, number, null, number, number, null, number][]] | BitfinexHeartbeat;
export {};
//# sourceMappingURL=bitfinex.d.ts.map