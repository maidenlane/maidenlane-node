import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class BitmexRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://www.bitmex.com/realtime";
    protected mapToSubscribeMessages(filters: Filter<string>[]): {
        op: string;
        args: string[];
    }[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=bitmex.d.ts.map