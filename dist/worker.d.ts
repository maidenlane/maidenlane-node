import { Exchange, Filter } from './types';
export declare type WorkerMessage = {
    sliceKey: string;
    slicePath: string;
};
export declare type WorkerJobPayload = {
    cacheDir: string;
    endpoint: string;
    apiKey: string;
    userAgent: string;
    fromDate: Date;
    toDate: Date;
    exchange: Exchange;
    filters: Filter<any>[];
    waitWhenDataNotYetAvailable?: boolean | number;
};
export declare const enum WorkerSignal {
    BEFORE_TERMINATE = "BEFORE_TERMINATE",
    READY_TO_TERMINATE = "READY_TO_TERMINATE"
}
//# sourceMappingURL=worker.d.ts.map