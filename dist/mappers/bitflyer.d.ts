import { BookChange, Trade } from '../types';
import { Mapper } from './mapper';
export declare const bitflyerTradesMapper: Mapper<'bitflyer', Trade>;
export declare class BitflyerBookChangeMapper implements Mapper<'bitflyer', BookChange> {
    private readonly _snapshotsInfo;
    canHandle(message: BitflyerExecutions | BitflyerBoard): boolean;
    getFilters(symbols?: string[]): ({
        readonly channel: "lightning_board_snapshot";
        readonly symbols: string[] | undefined;
    } | {
        readonly channel: "lightning_board";
        readonly symbols: string[] | undefined;
    })[];
    map(bitflyerBoard: BitflyerBoard, localTimestamp: Date): IterableIterator<BookChange>;
}
declare type BitflyerExecutions = {
    method: 'channelMessage';
    params: {
        channel: string;
        message: {
            id: number;
            side: 'SELL' | 'BUY';
            price: number;
            size: number;
            exec_date: string;
        }[];
    };
};
declare type BitflyerBookLevel = {
    price: number;
    size: number;
};
declare type BitflyerBoard = {
    method: 'channelMessage';
    params: {
        channel: string;
        message: {
            bids: BitflyerBookLevel[];
            asks: BitflyerBookLevel[];
        };
    };
};
export {};
//# sourceMappingURL=bitflyer.d.ts.map