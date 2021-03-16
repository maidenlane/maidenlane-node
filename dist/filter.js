"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueTradesOnly = exports.filter = void 0;
const handy_1 = require("./handy");
async function* filter(messages, filter) {
    for await (const message of messages) {
        if (filter(message)) {
            yield message;
        }
    }
}
exports.filter = filter;
function uniqueTradesOnly({ maxWindow, onDuplicateFound, skipStaleOlderThanSeconds } = {
    maxWindow: 500
}) {
    const perSymbolQueues = {};
    return (message) => {
        // pass trough any message that is not a trade
        if (message.type !== 'trade') {
            return true;
        }
        else {
            const trade = message;
            // pass trough trades that can't be uniquely identified
            // ignore index trades
            if (trade.id === undefined || trade.symbol.startsWith('.')) {
                return true;
            }
            else {
                let alreadySeenTrades = perSymbolQueues[trade.symbol];
                if (alreadySeenTrades === undefined) {
                    perSymbolQueues[trade.symbol] = new handy_1.CappedSet(maxWindow);
                    alreadySeenTrades = perSymbolQueues[trade.symbol];
                }
                const isDuplicate = alreadySeenTrades.has(trade.id);
                const isStale = skipStaleOlderThanSeconds !== undefined &&
                    trade.localTimestamp.valueOf() - trade.timestamp.valueOf() > skipStaleOlderThanSeconds * 1000;
                if (isDuplicate || isStale) {
                    if (onDuplicateFound !== undefined) {
                        onDuplicateFound(trade);
                    }
                    // refresh duplicated key position so it's added back at the beginning of the queue
                    alreadySeenTrades.remove(trade.id);
                    alreadySeenTrades.add(trade.id);
                    return false;
                }
                else {
                    alreadySeenTrades.add(trade.id);
                    return true;
                }
            }
        }
    };
}
exports.uniqueTradesOnly = uniqueTradesOnly;
//# sourceMappingURL=filter.js.map