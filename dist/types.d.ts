import { EXCHANGES, EXCHANGE_CHANNELS_INFO } from './consts';
export declare type Exchange = typeof EXCHANGES[number];
export declare type FilterForExchange = {
    [key in Exchange]: Filter<typeof EXCHANGE_CHANNELS_INFO[key][number]>;
};
export declare type Filter<T> = {
    channel: T;
    symbols?: string[];
};
export declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare type NormalizedData = {
    readonly type: string;
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly timestamp: Date;
    readonly localTimestamp: Date;
    readonly name?: string;
};
export declare type Trade = {
    readonly type: 'trade';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly id: string | undefined;
    readonly price: number;
    readonly amount: number;
    readonly side: 'buy' | 'sell' | 'unknown';
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type BookPriceLevel = {
    readonly price: number;
    readonly amount: number;
};
export declare type BookChange = {
    readonly type: 'book_change';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly isSnapshot: boolean;
    readonly bids: BookPriceLevel[];
    readonly asks: BookPriceLevel[];
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type DerivativeTicker = {
    readonly type: 'derivative_ticker';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly lastPrice: number | undefined;
    readonly openInterest: number | undefined;
    readonly fundingRate: number | undefined;
    readonly fundingTimestamp: Date | undefined;
    readonly predictedFundingRate: number | undefined;
    readonly indexPrice: number | undefined;
    readonly markPrice: number | undefined;
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type OptionSummary = NormalizedData & {
    type: 'option_summary';
    optionType: 'put' | 'call';
    strikePrice: number;
    expirationDate: Date;
    bestBidPrice: number | undefined;
    bestBidAmount: number | undefined;
    bestBidIV: number | undefined;
    bestAskPrice: number | undefined;
    bestAskAmount: number | undefined;
    bestAskIV: number | undefined;
    lastPrice: number | undefined;
    openInterest: number | undefined;
    markPrice: number | undefined;
    markIV: number | undefined;
    delta: number | undefined;
    gamma: number | undefined;
    vega: number | undefined;
    theta: number | undefined;
    rho: number | undefined;
    underlyingPrice: number | undefined;
    underlyingIndex: string;
};
export declare type Liquidation = {
    readonly type: 'liquidation';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly id: string | undefined;
    readonly price: number;
    readonly amount: number;
    readonly side: 'buy' | 'sell';
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type Disconnect = {
    readonly type: 'disconnect';
    readonly exchange: Exchange;
    readonly localTimestamp: Date;
};
export declare type TradeBar = {
    readonly type: 'trade_bar';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly name: string;
    readonly interval: number;
    readonly kind: 'time' | 'volume' | 'tick';
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close: number;
    readonly volume: number;
    readonly buyVolume: number;
    readonly sellVolume: number;
    readonly trades: number;
    readonly vwap: number;
    readonly openTimestamp: Date;
    readonly closeTimestamp: Date;
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type BookSnapshot = {
    readonly type: 'book_snapshot';
    readonly symbol: string;
    readonly exchange: Exchange;
    readonly name: string;
    readonly depth: number;
    readonly interval: number;
    readonly grouping?: number;
    readonly bids: Optional<BookPriceLevel>[];
    readonly asks: Optional<BookPriceLevel>[];
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
declare global {
    interface Date {
        μs?: number;
    }
}
export declare type Optional<T> = {
    [P in keyof T]: T[P] | undefined;
};
//# sourceMappingURL=types.d.ts.map