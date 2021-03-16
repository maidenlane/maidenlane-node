import { Exchange, Filter } from '../types';
import { RealTimeFeed } from './realtimefeed';
export * from './realtimefeed';
export declare function getRealTimeFeedFactory(exchange: Exchange): RealTimeFeed;
export declare function createRealTimeFeed(exchange: Exchange, filters: Filter<string>[], timeoutIntervalMS: number | undefined, onError?: (error: Error) => void): import("./realtimefeed").RealTimeFeedIterable;
export declare function setRealTimeFeedFactory(exchange: Exchange, realTimeFeed: RealTimeFeed): void;
//# sourceMappingURL=index.d.ts.map