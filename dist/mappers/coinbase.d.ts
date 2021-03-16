import { BookChange, Trade } from '../types';
import { Mapper } from './mapper';
export declare const coinbaseTradesMapper: Mapper<'coinbase', Trade>;
export declare class CoinbaseBookChangMapper implements Mapper<'coinbase', BookChange> {
    private readonly _symbolLastTimestampMap;
    canHandle(message: CoinbaseTrade | CoinbaseLevel2Snapshot | CoinbaseLevel2Update): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "snapshot";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "l2update";
        readonly symbols: string[] | undefined;
    })[];
    map(message: CoinbaseLevel2Update | CoinbaseLevel2Snapshot, localTimestamp: Date): IterableIterator<BookChange>;
}
declare type CoinbaseTrade = {
    type: 'match';
    trade_id: number;
    time: string;
    product_id: string;
    size: string;
    price: string;
    side: 'sell' | 'buy';
};
declare type CoinbaseSnapshotBookLevel = [string, string];
declare type CoinbaseLevel2Snapshot = {
    type: 'snapshot';
    product_id: string;
    bids: CoinbaseSnapshotBookLevel[];
    asks: CoinbaseSnapshotBookLevel[];
};
declare type CoinbaseUpdateBookLevel = ['buy' | 'sell', string, string];
declare type CoinbaseLevel2Update = {
    type: 'l2update';
    product_id: string;
    time: string;
    changes: CoinbaseUpdateBookLevel[];
};
export {};
//# sourceMappingURL=coinbase.d.ts.map