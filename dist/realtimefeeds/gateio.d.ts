import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class GateIORealTimeFeed extends RealTimeFeedBase {
    protected readonly wssURL = "wss://ws.gate.io/v3/";
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=gateio.d.ts.map