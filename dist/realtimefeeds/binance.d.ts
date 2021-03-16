/// <reference types="node" />
import { Writable } from 'stream';
import { Filter } from '../types';
import { MultiConnectionRealTimeFeedBase, PoolingClientBase, RealTimeFeedBase } from './realtimefeed';
declare abstract class BinanceRealTimeFeedBase extends MultiConnectionRealTimeFeedBase {
    protected abstract wssURL: string;
    protected abstract httpURL: string;
    protected abstract suffixes: {
        [key: string]: string;
    };
    protected _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): Generator<BinanceSingleConnectionRealTimeFeed | BinanceFuturesOpenInterestClient, void, unknown>;
}
declare class BinanceFuturesOpenInterestClient extends PoolingClientBase {
    private readonly _httpURL;
    private readonly _instruments;
    constructor(exchange: string, _httpURL: string, _instruments: string[]);
    protected poolDataToStream(outputStream: Writable): Promise<void>;
}
declare class BinanceSingleConnectionRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    private readonly _httpURL;
    private readonly _suffixes;
    constructor(exchange: string, filters: Filter<string>[], wssURL: string, _httpURL: string, _suffixes: {
        [key: string]: string;
    }, timeoutIntervalMS: number | undefined, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
    protected provideManualSnapshots(filters: Filter<string>[], shouldCancel: () => boolean): Promise<void>;
}
export declare class BinanceRealTimeFeed extends BinanceRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        depth: string;
    };
}
export declare class BinanceJerseyRealTimeFeed extends BinanceRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        depth: string;
    };
}
export declare class BinanceUSRealTimeFeed extends BinanceRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        depth: string;
    };
}
export declare class BinanceFuturesRealTimeFeed extends BinanceRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        depth: string;
        markPrice: string;
    };
}
export declare class BinanceDeliveryRealTimeFeed extends BinanceRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        depth: string;
        markPrice: string;
        indexPrice: string;
    };
}
export {};
//# sourceMappingURL=binance.d.ts.map