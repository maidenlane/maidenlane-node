import { OnLevelRemovedCB } from '../orderbook';
import { BookSnapshot } from '../types';
import { Computable } from './computable';
declare type BookSnapshotComputableOptions = {
    name?: string;
    depth: number;
    grouping?: number;
    interval: number;
    removeCrossedLevels?: boolean;
    onCrossedLevelRemoved?: OnLevelRemovedCB;
};
export declare const computeBookSnapshots: (options: BookSnapshotComputableOptions) => (() => Computable<BookSnapshot>);
export {};
//# sourceMappingURL=booksnapshot.d.ts.map