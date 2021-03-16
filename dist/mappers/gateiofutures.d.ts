import { BookChange, Exchange, Trade, DerivativeTicker } from '../types';
import { Mapper } from './mapper';
export declare class GateIOFuturesTradesMapper implements Mapper<'gate-io-futures', Trade> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: any): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(tradesMessage: GateIOFuturesTrades, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class GateIOFuturesBookChangeMapper implements Mapper<'gate-io-futures', BookChange> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: GateIOFuturesOrderBookSnapshot | GateIOFuturesOrderBookUpdate): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(depthMessage: GateIOFuturesOrderBookSnapshot | GateIOFuturesOrderBookUpdate, localTimestamp: Date): IterableIterator<BookChange>;
}
export declare class GateIOFuturesDerivativeTickerMapper implements Mapper<'gate-io-futures', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: GateIOFuturesTicker): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "tickers";
        readonly symbols: string[] | undefined;
    }[];
    map(message: GateIOFuturesTicker, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
declare type GateIOFuturesTrade = {
    size: number;
    id: number;
    create_time: number;
    price: string;
    contract: string;
};
declare type GateIOFuturesTrades = {
    time: number;
    channel: 'futures.trades';
    event: 'update';
    result: GateIOFuturesTrade[];
};
declare type GateIOFuturesSnapshotLevel = {
    p: string;
    s: number;
};
declare type GateIOFuturesOrderBookSnapshot = {
    time: number;
    channel: 'futures.order_book';
    event: 'all';
    result: {
        contract: string;
        asks: GateIOFuturesSnapshotLevel[];
        bids: GateIOFuturesSnapshotLevel[];
    };
};
declare type GateIOFuturesOrderBookUpdate = {
    time: number;
    channel: 'futures.order_book';
    event: 'update';
    result: {
        p: string;
        s: number;
        c: string;
    }[];
};
declare type GateIOFuturesTicker = {
    time: number;
    channel: 'futures.tickers';
    event: 'update';
    result: [
        {
            contract: string;
            last: string;
            funding_rate: string;
            mark_price: string;
            index_price: string;
            funding_rate_indicative: string;
        }
    ];
};
export {};
//# sourceMappingURL=gateiofutures.d.ts.map