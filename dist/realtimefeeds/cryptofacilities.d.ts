import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class CryptofacilitiesRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
    protected messageIsHeartbeat(message: any): boolean;
}
//# sourceMappingURL=cryptofacilities.d.ts.map