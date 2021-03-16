/// <reference types="node" />
import { Writable } from 'stream';
import { Filter } from '../types';
import { RealTimeFeedBase, PoolingClientBase, MultiConnectionRealTimeFeedBase } from './realtimefeed';
declare abstract class FTXRealTimeFeedBase extends MultiConnectionRealTimeFeedBase {
    protected abstract wssURL: string;
    protected abstract httpURL: string;
    protected _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): Generator<FtxSingleConnectionRealTimeFeed | FTXInstrumentInfoClient, void, unknown>;
}
declare class FtxSingleConnectionRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    constructor(exchange: string, filters: Filter<string>[], wssURL: string, timeoutIntervalMS: number | undefined, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
declare class FTXInstrumentInfoClient extends PoolingClientBase {
    private readonly _httpURL;
    private readonly _instruments;
    constructor(exchange: string, _httpURL: string, _instruments: string[]);
    protected poolDataToStream(outputStream: Writable): Promise<void>;
}
export declare class FtxRealTimeFeed extends FTXRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
}
export declare class FtxUSRealTimeFeed extends FTXRealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
}
export {};
//# sourceMappingURL=ftx.d.ts.map