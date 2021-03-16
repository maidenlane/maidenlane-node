import type { SymbolType } from './exchangedetails';
import type { Exchange } from './types';
export declare function getInstrumentInfo(exchange: Exchange): Promise<InstrumentInfo[]>;
export declare function getInstrumentInfo(exchange: Exchange | Exchange[], filter: InstrumentInfoFilter): Promise<InstrumentInfo[]>;
export declare function getInstrumentInfo(exchange: Exchange, symbol: string): Promise<InstrumentInfo>;
declare type InstrumentInfoFilter = {
    baseCurrency?: string | string[];
    quoteCurrency?: string | string[];
    type?: SymbolType | SymbolType[];
    contractType?: ContractType | ContractType[];
    active?: boolean;
};
export declare type ContractType = 'move' | 'linear_future' | 'inverse_future' | 'quanto_future' | 'linear_perpetual' | 'inverse_perpetual' | 'quanto_perpetual' | 'put_option' | 'call_option' | 'turbo_put_option' | 'turbo_call_option' | 'spread' | 'interest_rate_swap' | 'repo' | 'index';
export interface InstrumentInfo {
    /** symbol id */
    id: string;
    /** exchange id */
    exchange: string;
    /** normalized, so for example bitmex XBTUSD has base currency set to BTC not XBT */
    baseCurrency: string;
    /** normalized, so for example bitfinex BTCUST has quote currency set to USDT, not UST */
    quoteCurrency: string;
    type: SymbolType;
    /** indicates if the instrument can currently be traded. */
    active: boolean;
    /** date in ISO format */
    availableSince: string;
    /** date in ISO format */
    availableTo?: string;
    /** in ISO format, only for futures and options */
    expiry?: string;
    /** price tick size, price precision can be calculated from it */
    priceIncrement: number;
    /** amount tick size, amount/size precision can be calculated from it */
    amountIncrement: number;
    /** min order size */
    minTradeAmount: number;
    /** consider it as illustrative only, as it depends in practice on account traded volume levels, different categories, VIP levels, owning exchange currency etc */
    makerFee: number;
    /** consider it as illustrative only, as it depends in practice on account traded volume levels, different categories, VIP levels, owning exchange currency etc */
    takerFee: number;
    /** only for derivatives */
    inverse?: boolean;
    /** only for derivatives */
    contractMultiplier?: number;
    /** only for quanto instruments */
    quanto?: boolean;
    /**  only for quanto instruments as settlement currency is different base/quote currency */
    settlementCurrency?: string;
    /** strike price, only for options */
    strikePrice?: number;
    /** option type, only for options */
    optionType?: 'call' | 'put';
    /** date in ISO format */
    changes?: {
        until: string;
        priceIncrement?: number;
        amountIncrement?: number;
        contractMultiplier?: number;
    }[];
}
export {};
//# sourceMappingURL=instrumentinfo.d.ts.map