/// <reference types="node" />
import dbg from 'debug';
import { Writable } from 'stream';
import { Exchange, Filter } from '../types';
export declare type RealTimeFeed = {
    new (exchange: Exchange, filters: Filter<string>[], timeoutIntervalMS: number | undefined, onError?: (error: Error) => void): RealTimeFeedIterable;
};
export declare type RealTimeFeedIterable = AsyncIterable<any>;
export declare abstract class RealTimeFeedBase implements RealTimeFeedIterable {
    protected readonly _exchange: string;
    private readonly _timeoutIntervalMS;
    private readonly _onError?;
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    protected readonly debug: dbg.Debugger;
    protected abstract readonly wssURL: string;
    protected readonly throttleSubscribeMS: number;
    protected readonly manualSnapshotsBuffer: any[];
    private readonly _filters;
    private _receivedMessagesCount;
    private _ws?;
    private _connectionId;
    constructor(_exchange: string, filters: Filter<string>[], _timeoutIntervalMS: number | undefined, _onError?: ((error: Error) => void) | undefined);
    private _stream;
    protected send(msg: any): void;
    protected abstract mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected abstract messageIsError(message: any): boolean;
    protected messageIsHeartbeat(_msg: any): boolean;
    protected provideManualSnapshots(_filters: Filter<string>[], _shouldCancel: () => boolean): Promise<void>;
    protected onMessage(_msg: any): void;
    protected onConnected(): void;
    protected decompress?: (msg: any) => Buffer;
    private _monitorConnectionIfStale;
    private _sendPeriodicPing;
    private _onConnectionEstabilished;
    private _onConnectionClosed;
}
export declare abstract class MultiConnectionRealTimeFeedBase implements RealTimeFeedIterable {
    private readonly _exchange;
    private readonly _filters;
    private readonly _timeoutIntervalMS;
    private readonly _onError?;
    constructor(_exchange: string, _filters: Filter<string>[], _timeoutIntervalMS: number | undefined, _onError?: ((error: Error) => void) | undefined);
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    private _stream;
    protected abstract _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): IterableIterator<RealTimeFeedIterable>;
}
export declare abstract class PoolingClientBase implements RealTimeFeedIterable {
    private readonly _poolingIntervalSeconds;
    protected readonly debug: dbg.Debugger;
    private _tid;
    constructor(exchange: string, _poolingIntervalSeconds: number);
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    protected abstract poolDataToStream(outputStream: Writable): Promise<void>;
    private _startPooling;
    private _stream;
}
//# sourceMappingURL=realtimefeed.d.ts.map