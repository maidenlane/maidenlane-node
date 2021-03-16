import { Filter } from '../types';
import { RealTimeFeedBase } from './realtimefeed';
export declare class GeminiRealTimeFeed extends RealTimeFeedBase {
    protected wssURL: string;
    protected mapToSubscribeMessages(filters: Filter<string>[]): any[];
    protected messageIsError(message: any): boolean;
}
//# sourceMappingURL=gemini.d.ts.map