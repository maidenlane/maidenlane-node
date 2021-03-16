import { Mapper } from './mappers';
import { Exchange, Filter, FilterForExchange } from './types';
export declare function parseAsUTCDate(val: string): Date;
export declare function wait(delayMS: number): Promise<unknown>;
export declare function formatDateToPath(date: Date): string;
export declare function doubleDigit(input: number): string;
export declare function sha256(obj: object): string;
export declare function addMinutes(date: Date, minutes: number): Date;
export declare function addDays(date: Date, days: number): Date;
export declare function sequence(end: number, seed?: number): Generator<number, void, unknown>;
export declare const ONE_SEC_IN_MS = 1000;
export declare class HttpError extends Error {
    readonly status: number;
    readonly responseText: string;
    readonly url: string;
    constructor(status: number, responseText: string, url: string);
}
export declare function take(iterable: Iterable<any>, length: number): Generator<any, void, unknown>;
export declare function normalizeMessages(exchange: Exchange, messages: AsyncIterableIterator<{
    localTimestamp: Date;
    message: any;
} | undefined>, mappers: Mapper<any, any>[], createMappers: (localTimestamp: Date) => Mapper<any, any>[], withDisconnectMessages: boolean | undefined, filter?: (symbol: string) => boolean, currentTimestamp?: Date | undefined): AsyncGenerator<any, void, unknown>;
export declare function getFilters<T extends Exchange>(mappers: Mapper<T, any>[], symbols?: string[]): FilterForExchange[T][];
export declare function batch(symbols: string[], batchSize: number): Generator<string[], void, unknown>;
export declare function parseμs(dateString: string): number;
export declare function optimizeFilters(filters: Filter<any>[]): Filter<any>[];
export declare function download({ apiKey, downloadPath, url, userAgent }: {
    url: string;
    downloadPath: string;
    userAgent: string;
    apiKey: string;
}): Promise<void>;
export declare function cleanTempFiles(): void;
export declare class CircularBuffer<T> {
    private readonly _bufferSize;
    private _buffer;
    private _index;
    constructor(_bufferSize: number);
    append(value: T): T | undefined;
    items(): Generator<T, void, unknown>;
    get count(): number;
    clear(): void;
}
export declare class CappedSet<T> {
    private readonly _maxSize;
    private _set;
    constructor(_maxSize: number);
    has(value: T): boolean;
    add(value: T): void;
    remove(value: T): void;
    size(): number;
}
export declare function decimalPlaces(n: number): number;
//# sourceMappingURL=handy.d.ts.map