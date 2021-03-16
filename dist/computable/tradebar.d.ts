import { TradeBar } from '../types';
import { Computable } from './computable';
declare type BarKind = 'time' | 'volume' | 'tick';
declare type TradeBarComputableOptions = {
    kind: BarKind;
    interval: number;
    name?: string;
};
export declare const computeTradeBars: (options: TradeBarComputableOptions) => (() => Computable<TradeBar>);
export {};
//# sourceMappingURL=tradebar.d.ts.map