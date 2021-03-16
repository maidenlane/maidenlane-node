import { BookChange, Trade, DerivativeTicker, Exchange, Liquidation } from '../types';
import { Mapper } from './mapper';
export declare class FTXTradesMapper implements Mapper<'ftx' | 'ftx-us', Trade> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: FtxTrades | FtxOrderBook): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trades";
        readonly symbols: string[] | undefined;
    }[];
    map(ftxTrades: FtxTrades, localTimestamp: Date): IterableIterator<Trade>;
}
export declare const mapBookLevel: (level: FtxBookLevel) => {
    price: number;
    amount: number;
};
export declare class FTXBookChangeMapper implements Mapper<'ftx' | 'ftx-us', BookChange> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: FtxTrades | FtxOrderBook): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "orderbook";
        readonly symbols: string[] | undefined;
    }[];
    map(ftxOrderBook: FtxOrderBook, localTimestamp: Date): IterableIterator<BookChange>;
}
export declare class FTXDerivativeTickerMapper implements Mapper<'ftx', DerivativeTicker> {
    private readonly _exchange;
    private readonly pendingTickerInfoHelper;
    constructor(_exchange: Exchange);
    canHandle(message: FTXInstrument): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "instrument";
        readonly symbols: string[] | undefined;
    }[];
    map(message: FTXInstrument, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class FTXLiquidationsMapper implements Mapper<'ftx', Liquidation> {
    canHandle(message: FtxTrades | FtxOrderBook): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trades";
        readonly symbols: string[] | undefined;
    }[];
    map(ftxTrades: FtxTrades, localTimestamp: Date): IterableIterator<Liquidation>;
}
declare type FtxTrades = {
    channel: 'trades';
    market: string;
    type: 'update';
    data: {
        id: number | null;
        price: number;
        size: number;
        side: 'buy' | 'sell';
        time: string;
        liquidation?: boolean;
    }[];
};
declare type FtxBookLevel = [number, number];
declare type FtxOrderBook = {
    channel: 'orderbook';
    market: string;
    type: 'update' | 'partial';
    data: {
        time: number;
        bids: FtxBookLevel[];
        asks: FtxBookLevel[];
    };
};
declare type FTXInstrument = {
    channel: 'instrument';
    market: string;
    type: 'update';
    data: {
        stats: {
            nextFundingRate?: number;
            nextFundingTime?: string;
            openInterest: number;
        };
        info: {
            last: number;
            mark: number;
            index: number;
        };
    };
};
export {};
//# sourceMappingURL=ftx.d.ts.map