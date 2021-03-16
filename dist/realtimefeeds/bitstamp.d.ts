import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class BitstampRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected httpURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
    protected provideManualSnapshots(filters: Filter<string>[], shouldCancel: () => boolean): Promise<void>;
}
//# sourceMappingURL=bitstamp.d.ts.map