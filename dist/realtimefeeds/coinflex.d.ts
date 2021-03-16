import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class CoinflexRealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://v2api.coinflex.com/v2/websocket";
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=coinflex.d.ts.map