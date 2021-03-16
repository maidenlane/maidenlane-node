import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class CoinbaseRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected channelMappings: {
        full: string[];
        level2: string[];
        matches: string[];
        ticker: string[];
    };
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=coinbase.d.ts.map