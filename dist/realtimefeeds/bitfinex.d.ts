import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class BitfinexRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): ({
        event: string;
        flags: number;
    } | {
        event: string;
        channel: string;
        symbol: string;
        len?: undefined;
        prec?: undefined;
        freq?: undefined;
        key?: undefined;
    } | {
        event: string;
        channel: string;
        len: number;
        prec: string;
        freq: string;
        symbol: string;
        key?: undefined;
    } | {
        event: string;
        channel: string;
        key: string;
        symbol?: undefined;
        len?: undefined;
        prec?: undefined;
        freq?: undefined;
    } | undefined)[];
    protected messageIsError(message: any): boolean;
    protected messageIsHeartbeat(message: any): boolean;
}
//# sourceMappingURL=bitfinex.d.ts.map