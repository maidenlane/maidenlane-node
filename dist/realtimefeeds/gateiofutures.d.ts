import { Filter } from '../types';
import { RealTimeFeedBase, MultiConnectionRealTimeFeedBase } from './realtimefeed';
export declare class GateIOFuturesRealTimeFeed extends MultiConnectionRealTimeFeedBase {
    protected _getRealTimeFeeds(exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void): Generator<GateIOFuturesSingleConnectionRealTimeFeed, void, unknown>;
    private _only;
}
declare class GateIOFuturesSingleConnectionRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL: string;
    constructor(wsURLSuffix: string, exchange: string, filters: Filter<string>[], timeoutIntervalMS?: number, onError?: (error: Error) => void);
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
export {};
//# sourceMappingURL=gateiofutures.d.ts.map