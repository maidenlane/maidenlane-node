import { CircularBuffer } from '../handy';
import { BookChange, DerivativeTicker, Exchange, FilterForExchange, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
export declare class BinanceTradesMapper implements Mapper<'binance' | 'binance-jersey' | 'binance-us' | 'binance-futures' | 'binance-delivery', Trade> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: BinanceResponse<any>): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trade";
        readonly symbols: string[] | undefined;
    }[];
    map(binanceTradeResponse: BinanceResponse<BinanceTradeData>, localTimestamp: Date): Generator<Trade, void, unknown>;
}
export declare class BinanceBookChangeMapper implements Mapper<'binance' | 'binance-jersey' | 'binance-us' | 'binance-futures' | 'binance-delivery', BookChange> {
    protected readonly exchange: Exchange;
    protected readonly ignoreBookSnapshotOverlapError: boolean;
    protected readonly symbolToDepthInfoMapping: {
        [key: string]: LocalDepthInfo;
    };
    constructor(exchange: Exchange, ignoreBookSnapshotOverlapError: boolean);
    canHandle(message: BinanceResponse<any>): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "depth";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "depthSnapshot";
        readonly symbols: string[] | undefined;
    })[];
    map(message: BinanceResponse<BinanceDepthData | BinanceDepthSnapshotData>, localTimestamp: Date): Generator<BookChange, void, unknown>;
    protected mapBookDepthUpdate(binanceDepthUpdateData: BinanceDepthData, localTimestamp: Date): BookChange | undefined;
    protected mapBookLevel(level: BinanceBookLevel): {
        price: number;
        amount: number;
    };
}
export declare class BinanceFuturesBookChangeMapper extends BinanceBookChangeMapper implements Mapper<'binance-futures' | 'binance-delivery', BookChange> {
    protected readonly exchange: Exchange;
    protected readonly ignoreBookSnapshotOverlapError: boolean;
    constructor(exchange: Exchange, ignoreBookSnapshotOverlapError: boolean);
    protected mapBookDepthUpdate(binanceDepthUpdateData: BinanceFuturesDepthData, localTimestamp: Date): BookChange | undefined;
}
export declare class BinanceFuturesDerivativeTickerMapper implements Mapper<'binance-futures' | 'binance-delivery', DerivativeTicker> {
    protected readonly exchange: Exchange;
    private readonly pendingTickerInfoHelper;
    private readonly _indexPrices;
    constructor(exchange: Exchange);
    canHandle(message: BinanceResponse<any>): boolean;
    getFilters(symbols?: string[]): FilterForExchange['binance-futures' | 'binance-delivery'][];
    map(message: BinanceResponse<BinanceFuturesMarkPriceData | BinanceFuturesTickerData | BinanceFuturesOpenInterestData | BinanceFuturesIndexPriceData>, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class BinanceLiquidationsMapper implements Mapper<'binance-futures' | 'binance-delivery', Liquidation> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: BinanceResponse<any>): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "forceOrder";
        readonly symbols: string[] | undefined;
    }[];
    map(binanceTradeResponse: BinanceResponse<BinanceFuturesForceOrderData>, localTimestamp: Date): Generator<Liquidation, void, unknown>;
}
declare type BinanceResponse<T> = {
    stream: string;
    data: T;
};
declare type BinanceTradeData = {
    s: string;
    t: number;
    p: string;
    q: string;
    T: number;
    m: true;
    X?: 'INSURANCE_FUND' | 'MARKET';
};
declare type BinanceBookLevel = [string, string];
declare type BinanceDepthData = {
    lastUpdateId: undefined;
    E: number;
    s: string;
    U: number;
    u: number;
    b: BinanceBookLevel[];
    a: BinanceBookLevel[];
};
declare type BinanceFuturesDepthData = BinanceDepthData & {
    pu: number;
    T: number;
};
declare type BinanceDepthSnapshotData = {
    lastUpdateId: number;
    bids: BinanceBookLevel[];
    asks: BinanceBookLevel[];
    T?: number;
};
declare type LocalDepthInfo = {
    bufferedUpdates: CircularBuffer<BinanceDepthData>;
    snapshotProcessed?: boolean;
    lastUpdateId?: number;
    validatedFirstUpdate?: boolean;
};
declare type BinanceFuturesMarkPriceData = {
    e: 'markPriceUpdate';
    s: string;
    E: number;
    p: string;
    r?: string;
    T?: number;
    i?: string;
};
declare type BinanceFuturesTickerData = {
    e: '24hrTicker';
    E: number;
    s: string;
    c: string;
};
declare type BinanceFuturesOpenInterestData = {
    e: undefined;
    symbol: string;
    openInterest: string;
};
declare type BinanceFuturesIndexPriceData = {
    e: 'indexPriceUpdate';
    E: 1591261236000;
    i: string;
    p: string;
};
declare type BinanceFuturesForceOrderData = {
    o: {
        s: string;
        S: string;
        q: string;
        p: string;
        ap: string;
        X: 'FILLED';
        T: 1568014460893;
        z: string;
    };
};
export {};
//# sourceMappingURL=binance.d.ts.map