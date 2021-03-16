import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class BitflyerRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
    protected onMessage: (msg: any) => void;
}
//# sourceMappingURL=bitflyer.d.ts.map