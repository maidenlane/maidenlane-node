import { BookChange, Trade } from '../types';
import { Mapper } from './mapper';
export declare const bitstampTradesMapper: Mapper<'bitstamp', Trade>;
export declare class BitstampBookChangeMapper implements Mapper<'bitstamp', BookChange> {
    private readonly _symbolToDepthInfoMapping;
    canHandle(message: BitstampTrade | BitstampDiffOrderBook | BitstampDiffOrderBookSnapshot): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "diff_order_book";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BitstampDiffOrderBookSnapshot | BitstampDiffOrderBook, localTimestamp: Date): IterableIterator<BookChange>;
    private _mapBookDepthUpdate;
    private _mapBookLevel;
}
declare type BitstampTrade = {
    event: 'trade';
    channel: string;
    data: {
        microtimestamp: string;
        amount: number;
        price: number;
        type: number;
        id: number;
    };
};
declare type BitstampBookLevel = [string, string];
declare type BitstampDiffOrderBook = {
    data: {
        microtimestamp: string;
        timestamp: string;
        bids: BitstampBookLevel[];
        asks: BitstampBookLevel[];
    };
    event: 'data';
    channel: string;
};
declare type BitstampDiffOrderBookSnapshot = {
    event: 'snapshot';
    channel: string;
    data: {
        timestamp: string;
        microtimestamp?: string;
        bids: BitstampBookLevel[];
        asks: BitstampBookLevel[];
    };
};
export {};
//# sourceMappingURL=bitstamp.d.ts.map