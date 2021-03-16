import { MapperFactory } from './mappers';
import { Disconnect, Exchange, FilterForExchange } from './types';
export declare function stream<T extends Exchange, U extends boolean = false>({ exchange, filters, timeoutIntervalMS, withDisconnects, onError }: StreamOptions<T, U>): AsyncIterableIterator<U extends true ? {
    localTimestamp: Date;
    message: any;
} | undefined : {
    localTimestamp: Date;
    message: any;
}>;
export declare type StreamOptions<T extends Exchange, U extends boolean = false> = {
    exchange: T;
    filters: FilterForExchange[T][];
    timeoutIntervalMS?: number;
    withDisconnects?: U;
    onError?: (error: Error) => void;
};
export declare type StreamNormalizedOptions<T extends Exchange, U extends boolean = false> = {
    exchange: T;
    symbols?: string[];
    timeoutIntervalMS?: number;
    withDisconnectMessages?: U;
    onError?: (error: Error) => void;
};
export declare function streamNormalized<T extends Exchange, U extends MapperFactory<T, any>[], Z extends boolean = false>({ exchange, symbols, timeoutIntervalMS, withDisconnectMessages, onError }: StreamNormalizedOptions<T, Z>, ...normalizers: U): AsyncIterableIterator<Z extends true ? U extends MapperFactory<infer _, infer X>[] ? X | Disconnect : never : U extends MapperFactory<infer _, infer X>[] ? X : never>;
//# sourceMappingURL=stream.d.ts.map