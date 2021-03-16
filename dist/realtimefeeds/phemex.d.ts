import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class PhemexRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://phemex.com/ws";
    protected readonly throttleSubscribeMS = 100;
    protected readonly channelsMap: any;
    protected mapToSubscribeMessages(filters: Filter<string>[]): {
        id: number;
        method: any;
        params: string[];
    }[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=phemex.d.ts.map