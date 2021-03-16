import { Filter } from '../types';
import { RealTimeFeedBase, MultiConnectionRealTimeFeedBase } from './realtimefeed';
export declare class BybitRealTimeDataFeed extends MultiConnectionRealTimeFeedBase {
    protected _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): Generator<BybitSingleConnectionRealTimeDataFeed, void, unknown>;
    private _only;
}
declare class BybitSingleConnectionRealTimeDataFeed extends RealTimeFeedBase {
    protected readonly wssURL: string;
    constructor(wsURLSuffix: string, exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
export {};
//# sourceMappingURL=bybit.d.ts.map