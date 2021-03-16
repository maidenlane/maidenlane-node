import { Disconnect, NormalizedData } from '../types';
export declare type Computable<T extends NormalizedData> = {
    readonly sourceDataTypes: string[];
    compute(message: NormalizedData): IterableIterator<T>;
};
export declare type ComputableFactory<T extends NormalizedData> = () => Computable<T>;
export declare function compute<T extends ComputableFactory<any>[], U extends NormalizedData | Disconnect>(messages: AsyncIterableIterator<U>, ...computables: T): AsyncIterableIterator<T extends ComputableFactory<infer Z>[] ? (U extends Disconnect ? U | Z | Disconnect : U | Z) : never>;
//# sourceMappingURL=computable.d.ts.map