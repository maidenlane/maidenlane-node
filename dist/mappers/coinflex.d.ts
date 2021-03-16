import { BookChange, Trade, DerivativeTicker } from '../types';
import { Mapper } from './mapper';
export declare const coinflexTradesMapper: Mapper<'coinflex', Trade>;
export declare const coinflexBookChangeMapper: Mapper<'coinflex', BookChange>;
export declare class CoinflexDerivativeTickerMapper implements Mapper<'coinflex', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: CoinflexTickerMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "ticker";
        readonly symbols: string[] | undefined;
    }[];
    map(message: CoinflexTickerMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
declare type CoinflexTickerMessage = {
    data: [
        {
            last: string;
            markPrice?: string;
            marketCode: string;
            openInterest: string;
            timestamp: string;
        }
    ];
    table: 'ticker';
};
export {};
//# sourceMappingURL=coinflex.d.ts.map