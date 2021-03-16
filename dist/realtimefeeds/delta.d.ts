import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class DeltaRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://api.delta.exchange:2096";
    protected mapToSubscribeMessages(filters: Filter<string>[]): {
        type: string;
        payload: {
            channels: {
                name: string;
                symbols: string[] | undefined;
            }[];
        };
    }[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=delta.d.ts.map