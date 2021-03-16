import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class HitBtcRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected channelMappings: {
        subscribeOrderbook: string[];
        subscribeTrades: string[];
    };
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=hitbtc.d.ts.map