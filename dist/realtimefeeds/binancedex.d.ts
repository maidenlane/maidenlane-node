import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class BinanceDexRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): {
        method: string;
        topic: string;
        symbols: string[];
    }[];
    protected messageIsError(message: any): boolean;
    protected provideManualSnapshots(filters: Filter<string>[], shouldCancel: () => boolean): Promise<void>;
}
//# sourceMappingURL=binancedex.d.ts.map