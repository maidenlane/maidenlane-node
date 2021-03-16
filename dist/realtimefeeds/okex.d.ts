import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class OkexRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected decompress: (message: any) => any;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
export declare class OKCoinRealTimeFeed extends OkexRealTimeFeed {
    protected wssURL: string;
}
export declare class OkexOptionsRealTimeFeed extends OkexRealTimeFeed {
    private _defaultIndexes;
    private _channelRequiresIndexNotSymbol;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
}
//# sourceMappingURL=okex.d.ts.map