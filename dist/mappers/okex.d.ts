import { BookChange, DerivativeTicker, Exchange, Trade, OptionSummary, Liquidation } from '../types';
import { Mapper } from './mapper';
export declare class OkexTradesMapper implements Mapper<OKEX_EXCHANGES, Trade> {
    private readonly _exchange;
    private readonly _market;
    private readonly _seenSymbols;
    constructor(_exchange: Exchange, _market: OKEX_MARKETS);
    canHandle(message: OkexDataMessage): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(okexTradesMessage: OKexTradesDataMessage, localTimestamp: Date): IterableIterator<Trade>;
}
export declare class OkexBookChangeMapper implements Mapper<OKEX_EXCHANGES, BookChange> {
    private readonly _exchange;
    private readonly _market;
    private readonly _canUseTickByTickChannel;
    constructor(_exchange: Exchange, _market: OKEX_MARKETS, _canUseTickByTickChannel: boolean);
    canHandle(message: OkexDataMessage): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "spot/depth_l2_tbt" | "futures/depth_l2_tbt" | "swap/depth_l2_tbt" | "option/depth_l2_tbt";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "spot/depth" | "futures/depth" | "swap/depth" | "option/depth";
        readonly symbols: string[] | undefined;
    })[];
    map(okexDepthDataMessage: OkexDepthDataMessage, localTimestamp: Date): IterableIterator<BookChange>;
}
export declare class OkexDerivativeTickerMapper implements Mapper<'okex-futures' | 'okex-swap', DerivativeTicker> {
    private readonly _exchange;
    private readonly pendingTickerInfoHelper;
    private _futuresChannels;
    private _swapChannels;
    constructor(_exchange: Exchange);
    canHandle(message: OkexDataMessage): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(message: OkexTickersMessage | OkexFundingRateMessage | OkexMarkPriceMessage, localTimestamp: Date): IterableIterator<DerivativeTicker>;
}
export declare class OkexOptionSummaryMapper implements Mapper<'okex-options', OptionSummary> {
    private readonly _indexPrices;
    private readonly expiration_regex;
    canHandle(message: OkexDataMessage): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "option/summary";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "index/ticker";
        readonly symbols: string[] | undefined;
    })[];
    map(message: OkexOptionSummaryData | OkexIndexData, localTimestamp: Date): IterableIterator<OptionSummary> | undefined;
}
export declare class OkexLiquidationsMapper implements Mapper<OKEX_EXCHANGES, Liquidation> {
    private readonly _exchange;
    private readonly _market;
    constructor(_exchange: Exchange, _market: OKEX_MARKETS);
    canHandle(message: OkexDataMessage): boolean;
    getFilters(symbols?: string[]): {
        channel: string;
        symbols: string[] | undefined;
    }[];
    map(okexLiquidationDataMessage: OkexLiqudationDataMessage, localTimestamp: Date): IterableIterator<Liquidation>;
}
declare type OkexDataMessage = {
    table: string;
};
declare type OKexTradesDataMessage = {
    data: {
        side: 'buy' | 'sell';
        trade_id: string | number;
        price: string | number;
        qty?: string | number;
        size?: string | number;
        instrument_id: string;
        timestamp: string;
    }[];
};
declare type OkexLiqudationDataMessage = {
    data: {
        loss: string;
        size: string;
        price: string;
        created_at: string;
        type: string;
        instrument_id: string;
    }[];
};
declare type OkexTickersMessage = {
    data: {
        last: string | number;
        best_bid: string | number;
        best_ask: string | number;
        open_interest: string | undefined;
        instrument_id: string;
        timestamp: string;
    }[];
};
declare type OkexFundingRateMessage = {
    data: {
        funding_rate: string;
        funding_time: string;
        estimated_rate?: string;
        instrument_id: string;
        timestamp: undefined;
    }[];
};
declare type OkexMarkPriceMessage = {
    data: {
        instrument_id: string;
        mark_price: string;
        timestamp: string;
    }[];
};
declare type OkexDepthDataMessage = {
    action: 'partial' | 'update';
    data: {
        instrument_id: string;
        asks: OkexBookLevel[];
        bids: OkexBookLevel[];
        timestamp: string;
    }[];
};
declare type OkexBookLevel = [number | string, number | string, number | string, number | string];
declare type OKEX_EXCHANGES = 'okex' | 'okcoin' | 'okex-futures' | 'okex-swap' | 'okex-options';
declare type OKEX_MARKETS = 'spot' | 'swap' | 'futures' | 'option';
declare type OkexIndexData = {
    table: 'index/ticker';
    data: [
        {
            last: number;
            instrument_id: string;
        }
    ];
};
declare type OkexOptionSummaryData = {
    table: 'option/summary';
    data: [
        {
            instrument_id: string;
            underlying: string;
            best_ask: string;
            best_bid: string;
            best_ask_size: string;
            best_bid_size: string;
            change_rate: string;
            delta: string;
            gamma: string;
            bid_vol: string;
            ask_vol: string;
            mark_vol: string;
            last: string;
            leverage: string;
            mark_price: string;
            theta: string;
            vega: string;
            open_interest: string;
            timestamp: string;
        }
    ];
};
export {};
//# sourceMappingURL=okex.d.ts.map