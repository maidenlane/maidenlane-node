import { BookChange, DerivativeTicker, Exchange, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
export declare class BybitTradesMapper implements Mapper<'bybit', Trade> {
    private readonly _exchange;
    private readonly _seenSymbols;
    constructor(_exchange: Exchange);
    canHandle(message: BybitDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trade";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BybitTradeDataMessage, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class BybitBookChangeMapper implements Mapper<'bybit', BookChange> {
    protected readonly _exchange: Exchange;
    private readonly _canUseBook200Channel;
    constructor(_exchange: Exchange, _canUseBook200Channel: boolean);
    canHandle(message: BybitDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "orderBook_200";
        readonly symbols: string[] | undefined;
    }[] | {
        readonly channel: "orderBookL2_25";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BybitBookSnapshotDataMessage | BybitBookSnapshotUpdateMessage, localTimestamp: Date): Generator<{
        readonly type: "book_change";
        readonly symbol: string;
        readonly exchange: "bitmex" | "deribit" | "binance-futures" | "binance-delivery" | "binance" | "ftx" | "okex-futures" | "okex-options" | "okex-swap" | "okex" | "huobi-dm" | "huobi-dm-swap" | "huobi-dm-linear-swap" | "huobi" | "bitfinex-derivatives" | "bitfinex" | "coinbase" | "cryptofacilities" | "kraken" | "bitstamp" | "gemini" | "poloniex" | "bybit" | "phemex" | "delta" | "ftx-us" | "binance-us" | "gate-io-futures" | "gate-io" | "okcoin" | "bitflyer" | "hitbtc" | "coinflex" | "binance-jersey" | "binance-dex";
        readonly isSnapshot: boolean;
        readonly bids: {
            price: number;
            amount: number;
        }[];
        readonly asks: {
            price: number;
            amount: number;
        }[];
        readonly timestamp: Date;
        readonly localTimestamp: Date;
    }, void, unknown>;
    private _mapBookLevel;
}
export declare class BybitDerivativeTickerMapper implements Mapper<'bybit', DerivativeTicker> {
    private readonly pendingTickerInfoHelper;
    canHandle(message: BybitDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "instrument_info";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BybitInstrumentDataMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class BybitLiquidationsMapper implements Mapper<'bybit', Liquidation> {
    private readonly _exchange;
    constructor(_exchange: Exchange);
    canHandle(message: BybitDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "liquidation";
        readonly symbols: string[] | undefined;
    }[];
    map(message: BybitLiquidationMessage, localTimestamp: Date): IterableIterator<Liquidation>;
}
declare type BybitDataMessage = {
    topic: string;
};
declare type BybitTradeDataMessage = BybitDataMessage & {
    data: {
        timestamp: string;
        trade_time_ms?: number | string;
        symbol: string;
        side: 'Buy' | 'Sell';
        size: number;
        price: number | string;
        trade_id: string;
    }[];
};
declare type BybitBookLevel = {
    price: string;
    side: 'Buy' | 'Sell';
    size?: number;
};
declare type BybitBookSnapshotDataMessage = BybitDataMessage & {
    type: 'snapshot';
    data: BybitBookLevel[] | {
        order_book: BybitBookLevel[];
    };
    timestamp_e6: number | string;
};
declare type BybitBookSnapshotUpdateMessage = BybitDataMessage & {
    type: 'delta';
    data: {
        delete: BybitBookLevel[];
        update: BybitBookLevel[];
        insert: BybitBookLevel[];
    };
    timestamp_e6: number | string;
};
declare type BybitInstrumentUpdate = {
    symbol: string;
    mark_price_e4?: number;
    index_price_e4?: number;
    open_interest?: number;
    open_interest_e8?: number;
    funding_rate_e6?: number;
    predicted_funding_rate_e6?: number;
    next_funding_time?: string;
    last_price_e4?: number;
    updated_at: string;
};
declare type BybitInstrumentDataMessage = BybitDataMessage & {
    timestamp_e6: string;
    data: BybitInstrumentUpdate | {
        update: [BybitInstrumentUpdate];
    };
};
declare type BybitLiquidationMessage = BybitDataMessage & {
    data: {
        id: number;
        qty: number;
        side: 'Sell' | 'Buy';
        time: number;
        symbol: string;
        price: number;
    }[];
};
export {};
//# sourceMappingURL=bybit.d.ts.map