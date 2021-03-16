/// <reference types="node" />
import { Filter } from '../types';
import { RealTimeFeedBase, MultiConnectionRealTimeFeedBase, PoolingClientBase } from './realtimefeed';
import { Writable } from 'stream';
declare abstract class HuobiRealTimeFeedBase extends MultiConnectionRealTimeFeedBase {
    protected abstract wssURL: string;
    protected abstract httpURL: string;
    protected abstract suffixes: {
        [key: string]: string;
    };
    private _marketDataChannels;
    private _notificationsChannels;
    protected _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): Generator<HuobiMarketDataRealTimeFeed | HuobiNotificationsRealTimeFeed | HuobiOpenInterestClient, void, unknown>;
    protected getURLPath(symbol: string): string;
}
declare class HuobiMarketDataRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    private readonly _suffixes;
    constructor(exchange: string, filters: Filter<string>[], wssURL: string, _suffixes: {
        [key: string]: string;
    }, timeoutIntervalMS: number | undefined, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected provideManualSnapshots(filters: Filter<string>[], shouldCancel: () => boolean): Promise<void>;
    protected decompress: (message: any) => Buffer;
    protected messageIsError(message: any): boolean;
    protected onMessage(message: any): void;
    protected messageIsHeartbeat(message: any): boolean;
}
declare class HuobiNotificationsRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    constructor(exchange: string, filters: Filter<string>[], wssURL: string, timeoutIntervalMS: number | undefined, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected decompress: (message: any) => Buffer;
    protected messageIsError(message: any): boolean;
    protected onMessage(message: any): void;
    protected messageIsHeartbeat(message: any): boolean;
}
declare class HuobiOpenInterestClient extends PoolingClientBase {
    private readonly _httpURL;
    private readonly _instruments;
    private readonly _getURLPath;
    constructor(exchange: string, _httpURL: string, _instruments: string[], _getURLPath: (symbol: string) => string);
    protected poolDataToStream(outputStream: Writable): Promise<void>;
}
export declare class HuobiRealTimeFeed extends HuobiRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        trade: string;
        depth: string;
        mbp: string;
    };
}
export declare class HuobiDMRealTimeFeed extends HuobiRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        trade: string;
        depth: string;
        basis: string;
    };
    private _contractTypeMap;
    protected getURLPath(symbol: string): string;
}
export declare class HuobiDMSwapRealTimeFeed extends HuobiRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        trade: string;
        depth: string;
        basis: string;
    };
    protected getURLPath(symbol: string): string;
}
export declare class HuobiDMLinearSwapRealTimeFeed extends HuobiRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected suffixes: {
        trade: string;
        depth: string;
        basis: string;
    };
    protected getURLPath(symbol: string): string;
}
export {};
//# sourceMappingURL=huobi.d.ts.map