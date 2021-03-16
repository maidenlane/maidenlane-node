import { Filter, FilterForExchange } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class DeribitRealTimeDataFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected channelsWithIntervals: FilterForExchange['deribit']['channel'][];
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
    protected onConnected(): void;
    protected messageIsHeartbeat(msg: any): boolean;
    protected onMessage(msg: any): void;
}
//# sourceMappingURL=deribit.d.ts.map