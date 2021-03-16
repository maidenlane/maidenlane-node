import { Exchange, FilterForExchange } from './types';
export declare function getExchangeDetails<T extends Exchange>(exchange: T): Promise<ExchangeDetails<T>>;
export declare type SymbolType = 'spot' | 'future' | 'perpetual' | 'option';
export declare type Stats = {
    trades: number;
    bookChanges: number;
};
export declare type DatasetType = 'trades' | 'incremental_book_L2' | 'quotes' | 'derivative_ticker' | 'options_chain';
declare type Datasets = {
    dataTypes: DatasetType[];
    formats: ['csv'];
    exportedFrom: Date;
    exportedUntil: Date;
    stats: Stats;
    symbols: {
        id: string;
        type: SymbolType;
        availableSince: string;
        availableTo: string;
        stats: Stats;
    }[];
};
export declare type ExchangeDetailsBase<T extends Exchange> = {
    id: T;
    name: string;
    filterable: boolean;
    enabled: boolean;
    availableSince: string;
    availableChannels: FilterForExchange[T]['channel'][];
    availableSymbols: {
        id: string;
        type: SymbolType;
        availableSince: string;
        availableTo?: string;
        name?: string;
    }[];
    incidentReports: {
        from: string;
        to: string;
        status: 'resolved' | 'wontfix';
        details: string;
    };
};
declare type ExchangeDetails<T extends Exchange> = (ExchangeDetailsBase<T> & {
    supportsDatasets: false;
}) | (ExchangeDetailsBase<T> & {
    supportsDatasets: true;
    datasets: Datasets;
});
export {};
//# sourceMappingURL=exchangedetails.d.ts.map