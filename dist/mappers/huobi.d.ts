import { BookChange, DerivativeTicker, Exchange, Liquidation, Trade } from '../types';
import { Mapper } from './mapper';
import { CircularBuffer } from '../handy';
export declare class HuobiTradesMapper implements Mapper<'huobi' | 'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', Trade> {
    private readonly _exchange;
    private readonly _seenSymbols;
    constructor(_exchange: Exchange);
    canHandle(message: HuobiDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "trade";
        readonly symbols: string[] | undefined;
    }[];
    map(message: HuobiTradeDataMessage, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class HuobiBookChangeMapper implements Mapper<'huobi' | 'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', BookChange> {
    protected readonly _exchange: Exchange;
    constructor(_exchange: Exchange);
    canHandle(message: HuobiDataMessage): boolean;
    getFilters(symbols?: string[]): {
        readonly channel: "depth";
        readonly symbols: string[] | undefined;
    }[];
    map(message: HuobiDepthDataMessage, localTimestamp: Date): Generator<{
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
export declare class HuobiMBPBookChangeMapper implements Mapper<'huobi', BookChange> {
    protected readonly _exchange: Exchange;
    protected readonly symbolToMBPInfoMapping: {
        [key: string]: MBPInfo;
    };
    constructor(_exchange: Exchange);
    canHandle(message: any): any;
    getFilters(symbols?: string[]): {
        readonly channel: "mbp";
        readonly symbols: string[] | undefined;
    }[];
    map(message: HuobiMBPDataMessage | HuobiMBPSnapshot, localTimestamp: Date): Generator<{
        readonly type: "book_change";
        readonly symbol: string;
        readonly exchange: "bitmex" | "deribit" | "binance-futures" | "binance-delivery" | "binance" | "ftx" | "okex-futures" | "okex-options" | "okex-swap" | "okex" | "huobi-dm" | "huobi-dm-swap" | "huobi-dm-linear-swap" | "huobi" | "bitfinex-derivatives" | "bitfinex" | "coinbase" | "cryptofacilities" | "kraken" | "bitstamp" | "gemini" | "poloniex" | "bybit" | "phemex" | "delta" | "ftx-us" | "binance-us" | "gate-io-futures" | "gate-io" | "okcoin" | "bitflyer" | "hitbtc" | "coinflex" | "binance-jersey" | "binance-dex";
        readonly isSnapshot: false;
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
    } | {
        readonly type: "book_change";
        readonly symbol: string;
        readonly exchange: "bitmex" | "deribit" | "binance-futures" | "binance-delivery" | "binance" | "ftx" | "okex-futures" | "okex-options" | "okex-swap" | "okex" | "huobi-dm" | "huobi-dm-swap" | "huobi-dm-linear-swap" | "huobi" | "bitfinex-derivatives" | "bitfinex" | "coinbase" | "cryptofacilities" | "kraken" | "bitstamp" | "gemini" | "poloniex" | "bybit" | "phemex" | "delta" | "ftx-us" | "binance-us" | "gate-io-futures" | "gate-io" | "okcoin" | "bitflyer" | "hitbtc" | "coinflex" | "binance-jersey" | "binance-dex";
        readonly isSnapshot: true;
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
    private _mapMBPUpdate;
    private _mapBookLevel;
}
export declare class HuobiDerivativeTickerMapper implements Mapper<'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', DerivativeTicker> {
    private readonly _exchange;
    private readonly pendingTickerInfoHelper;
    constructor(_exchange: Exchange);
    canHandle(message: any): any;
    getFilters(symbols?: string[]): import("../types").Filter<"trade" | "depth" | "detail" | "bbo" | "basis" | "liquidation_orders" | "contract_info" | "open_interest" | "elite_account_ratio" | "elite_position_ratio" | "funding_rate">[];
    map(message: HuobiBasisDataMessage | HuobiFundingRateNotification | HuobiOpenInterestDataMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class HuobiLiquidationsMapper implements Mapper<'huobi-dm' | 'huobi-dm-swap' | 'huobi-dm-linear-swap', Liquidation> {
    private readonly _exchange;
    private readonly _contractCodeToSymbolMap;
    private readonly _contractTypesSuffixes;
    constructor(_exchange: Exchange);
    canHandle(message: HuobiLiquidationOrder | HuobiContractInfo): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "liquidation_orders";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "contract_info";
        readonly symbols: string[] | undefined;
    })[];
    private _updateContractCodeToSymbolMap;
    map(message: HuobiLiquidationOrder, localTimestamp: Date): IterableIterator<Liquidation>;
}
declare type HuobiDataMessage = {
    ch: string;
};
declare type HuobiTradeDataMessage = HuobiDataMessage & {
    tick: {
        data: {
            id: number;
            tradeId?: number;
            price: number;
            amount: number;
            direction: 'buy' | 'sell';
            ts: number;
        }[];
    };
};
declare type HuobiBookLevel = [number, number];
declare type HuobiDepthDataMessage = HuobiDataMessage & ({
    update?: boolean;
    ts: number;
    tick: {
        bids: HuobiBookLevel[] | null;
        asks: HuobiBookLevel[] | null;
    };
} | {
    ts: number;
    tick: {
        bids?: HuobiBookLevel[] | null;
        asks?: HuobiBookLevel[] | null;
        event: 'snapshot' | 'update';
    };
});
declare type HuobiBasisDataMessage = HuobiDataMessage & {
    ts: number;
    tick: {
        index_price: string;
        contract_price: string;
    };
};
declare type HuobiFundingRateNotification = {
    op: 'notify';
    topic: string;
    ts: number;
    data: {
        settlement_time: string;
        funding_rate: string;
        estimated_rate: string;
        contract_code: string;
    }[];
};
declare type HuobiOpenInterestDataMessage = HuobiDataMessage & {
    ts: number;
    data: {
        volume: number;
    }[];
};
declare type HuobiMBPDataMessage = HuobiDataMessage & {
    ts: number;
    tick: {
        bids?: HuobiBookLevel[] | null;
        asks?: HuobiBookLevel[] | null;
        seqNum: number;
        prevSeqNum: number;
    };
};
declare type HuobiMBPSnapshot = {
    ts: number;
    rep: string;
    data: {
        bids: HuobiBookLevel[];
        asks: HuobiBookLevel[];
        seqNum: number;
    };
};
declare type MBPInfo = {
    bufferedUpdates: CircularBuffer<HuobiMBPDataMessage>;
    snapshotProcessed?: boolean;
};
declare type HuobiLiquidationOrder = {
    op: 'notify';
    topic: string;
    ts: number;
    data: {
        symbol: string;
        contract_code: string;
        direction: 'buy' | 'sell';
        offset: string;
        volume: number;
        price: number;
        created_at: number;
    }[];
};
declare type HuobiContractInfo = {
    op: 'notify';
    topic: string;
    ts: number;
    data: {
        symbol: string;
        contract_code: string;
        contract_type: 'this_week' | 'next_week' | 'quarter' | 'next_quarter';
    }[];
};
export {};
//# sourceMappingURL=huobi.d.ts.map