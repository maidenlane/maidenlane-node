declare type Combinable = {
    localTimestamp: Date;
};
export declare function combine<T extends AsyncIterableIterator<Combinable>[]>(...iterators: T): AsyncIterableIterator<T extends AsyncIterableIterator<infer U>[] ? U : never>;
export {};
//# sourceMappingURL=combine.d.ts.map