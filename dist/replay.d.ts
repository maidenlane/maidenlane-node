/// <reference types="node" />
import { MapperFactory } from './mappers';
import { Disconnect, Exchange, FilterForExchange } from './types';
export declare function replay<T extends Exchange, U extends boolean = false, Z extends boolean = false>({ exchange, from, to, filters, skipDecoding, withDisconnects, apiKey, withMicroseconds, autoCleanup, waitWhenDataNotYetAvailable }: ReplayOptions<T, U, Z>): AsyncIterableIterator<Z extends true ? U extends true ? {
    localTimestamp: Buffer;
    message: Buffer;
} | undefined : {
    localTimestamp: Date;
    message: any;
} | undefined : U extends true ? {
    localTimestamp: Buffer;
    message: Buffer;
} : {
    localTimestamp: Date;
    message: any;
}>;
export declare function replayNormalized<T extends Exchange, U extends MapperFactory<T, any>[], Z extends boolean = false>({ exchange, symbols, from, to, withDisconnectMessages, apiKey, autoCleanup, waitWhenDataNotYetAvailable }: ReplayNormalizedOptions<T, Z>, ...normalizers: U): AsyncIterableIterator<Z extends true ? U extends MapperFactory<infer _, infer X>[] ? X | Disconnect : never : U extends MapperFactory<infer _, infer X>[] ? X : never>;
export declare type ReplayOptions<T extends Exchange, U extends boolean = false, Z extends boolean = false> = {
    readonly exchange: T;
    readonly from: string;
    readonly to: string;
    readonly filters: FilterForExchange[T][];
    readonly skipDecoding?: U;
    readonly withDisconnects?: Z;
    readonly apiKey?: string;
    readonly withMicroseconds?: boolean;
    readonly autoCleanup?: boolean;
    readonly waitWhenDataNotYetAvailable?: boolean | number;
};
export declare type ReplayNormalizedOptions<T extends Exchange, U extends boolean = false> = {
    readonly exchange: T;
    readonly symbols?: string[];
    readonly from: string;
    readonly to: string;
    readonly withDisconnectMessages?: U;
    readonly apiKey?: string;
    readonly autoCleanup?: boolean;
    readonly waitWhenDataNotYetAvailable?: boolean | number;
};
//# sourceMappingURL=replay.d.ts.map