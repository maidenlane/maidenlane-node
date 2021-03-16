import { DatasetType } from './exchangedetails';
import { Exchange } from './types';
export declare function downloadDatasets(downloadDatasetsOptions: DownloadDatasetsOptions): Promise<void>;
declare type GetFilenameOptions = {
    exchange: Exchange;
    dataType: DatasetType;
    symbol: string;
    date: Date;
    format: string;
};
declare type DownloadDatasetsOptions = {
    exchange: Exchange;
    dataTypes: DatasetType[];
    symbols: string[];
    from: string;
    to: string;
    format?: 'csv';
    apiKey?: string;
    downloadDir?: string;
    getFilename?: (options: GetFilenameOptions) => string;
};
export {};
//# sourceMappingURL=downloaddatasets.d.ts.map