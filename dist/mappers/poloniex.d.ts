import { BookChange, Trade } from '../types';
import { Mapper } from './mapper';
export declare class PoloniexTradesMapper implements Mapper<'poloniex', Trade> {
    private readonly _channelIdToSymbolMap;
    canHandle(message: PoloniexPriceAggreatedMessage): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(message: PoloniexPriceAggreatedMessage, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class PoloniexBookChangeMapper implements Mapper<'poloniex', BookChange> {
    private readonly _channelIdToSymbolMap;
    canHandle(message: PoloniexPriceAggreatedMessage): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(message: PoloniexPriceAggreatedMessage, localTimestamp: Date): IterableIterator<BookChange>;
}
declare type PoloniexBookSnapshot = ['i', {
    currencyPair: string;
    orderBook: [{
        [key: string]: string;
    }, {
        [key: string]: string;
    }];
}];
declare type PoloniexBookUpdate = ['o', 0 | 1, string, string];
declare type PoloniexTrade = ['t', string, 1 | 0, string, string, number];
declare type PoloniexPriceAggreatedMessage = [number, number, (PoloniexBookSnapshot | PoloniexBookUpdate | PoloniexTrade)[], string?];
export {};
//# sourceMappingURL=poloniex.d.ts.map