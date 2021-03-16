import { BookChange, Exchange, Trade } from '../types';
import { Mapper } from './mapper';
export declare class GateIOTradesMapper implements Mapper<'gate-io', Trade> {
    private readonly _exchange;
    private readonly _seenSymbols;
    constructor(_exchange: Exchange);
    canHandle(message: any): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(tradesMessage: GateIOTrades, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class GateIOBookChangeMapper implements Mapper<'gate-io', BookChange> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: any): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(depthMessage: GateIODepth, localTimestamp: Date): IterableIterator<BookChange>;
}
declare type GateIOTrade = {
    id: number;
    time: number;
    price: string;
    amount: string;
    type: 'sell' | 'buy';
};
declare type GateIOTrades = {
    method: 'trades.update';
    params: [string, GateIOTrade[]];
};
declare type GateIODepthLevel = [string, string];
declare type GateIODepth = {
    method: 'depth.update';
    params: [
        boolean,
        {
            bids?: GateIODepthLevel[];
            asks?: GateIODepthLevel[];
        },
        string
    ];
};
export {};
//# sourceMappingURL=gateio.d.ts.map