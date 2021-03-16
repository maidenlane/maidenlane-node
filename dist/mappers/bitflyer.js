"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitflyerBookChangeMapper = exports.bitflyerTradesMapper = void 0;
const handy_1 = require("../handy");
exports.bitflyerTradesMapper = {
    canHandle(message) {
        return message.params.channel.startsWith('lightning_executions');
    },
    getFilters(symbols) {
        return [
            {
                channel: 'lightning_executions',
                symbols
            }
        ];
    },
    *map(bitflyerExecutions, localTimestamp) {
        const symbol = bitflyerExecutions.params.channel.replace('lightning_executions_', '');
        for (const execution of bitflyerExecutions.params.message) {
            const timestamp = new Date(execution.exec_date);
            timestamp.μs = handy_1.parseμs(execution.exec_date);
            const trade = {
                type: 'trade',
                symbol,
                exchange: 'bitflyer',
                id: String(execution.id),
                price: execution.price,
                amount: execution.size,
                side: execution.side === 'BUY' ? 'buy' : execution.side === 'SELL' ? 'sell' : 'unknown',
                timestamp,
                localTimestamp: localTimestamp
            };
            yield trade;
        }
    }
};
const mapBookLevel = ({ price, size }) => {
    return { price, amount: size };
};
class BitflyerBookChangeMapper {
    constructor() {
        this._snapshotsInfo = new Map();
    }
    canHandle(message) {
        return message.params.channel.startsWith('lightning_board');
    }
    getFilters(symbols) {
        return [
            {
                channel: 'lightning_board_snapshot',
                symbols
            },
            {
                channel: 'lightning_board',
                symbols
            }
        ];
    }
    *map(bitflyerBoard, localTimestamp) {
        const channel = bitflyerBoard.params.channel;
        const isSnapshot = channel.startsWith('lightning_board_snapshot_');
        const symbol = isSnapshot ? channel.replace('lightning_board_snapshot_', '') : channel.replace('lightning_board_', '');
        if (this._snapshotsInfo.has(symbol) === false) {
            if (isSnapshot) {
                this._snapshotsInfo.set(symbol, true);
            }
            else {
                // skip change messages until we've received book snapshot
                return;
            }
        }
        yield {
            type: 'book_change',
            symbol,
            exchange: 'bitflyer',
            isSnapshot,
            bids: bitflyerBoard.params.message.bids.map(mapBookLevel),
            asks: bitflyerBoard.params.message.asks.map(mapBookLevel),
            timestamp: localTimestamp,
            localTimestamp
        };
    }
}
exports.BitflyerBookChangeMapper = BitflyerBookChangeMapper;
//# sourceMappingURL=bitflyer.js.map