import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class PoloniexRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://api2.poloniex.com";
    protected mapToSubscribeMessages(filters: Filter<string>[]): {
        command: string;
        channel: string;
    }[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=poloniex.d.ts.map