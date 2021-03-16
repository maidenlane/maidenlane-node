"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamNormalized = exports.stream = void 0;
const debug_1 = require("./debug");
const handy_1 = require("./handy");
const realtimefeeds_1 = require("./realtimefeeds");
async function* _stream({ exchange, filters, timeoutIntervalMS = 10000, withDisconnects = undefined, onError = undefined }) {
    validateStreamOptions(filters);
    const realTimeFeed = realtimefeeds_1.createRealTimeFeed(exchange, filters, timeoutIntervalMS, onError);
    for await (const message of realTimeFeed) {
        if (message === undefined) {
            // undefined message means that websocket connection has been closed
            // notify about it by yielding undefined if flag is set
            if (withDisconnects) {
                yield undefined;
            }
        }
        else {
            yield {
                localTimestamp: new Date(),
                message
            };
        }
    }
}
function stream({ exchange, filters, timeoutIntervalMS = 10000, withDisconnects = undefined, onError = undefined }) {
    let _iterator = _stream({ exchange, filters, timeoutIntervalMS, withDisconnects, onError });
    _iterator.__realtime__ = true;
    return _iterator;
}
exports.stream = stream;
async function* _streamNormalized({ exchange, symbols, timeoutIntervalMS = 10000, withDisconnectMessages = undefined, onError = undefined }, ...normalizers) {
    // mappers assume that symbols are uppercased by default
    // if user by mistake provide lowercase one let's automatically fix it
    if (symbols !== undefined) {
        symbols = symbols.map((s) => s.toUpperCase());
    }
    while (true) {
        try {
            const createMappers = (localTimestamp) => normalizers.map((m) => m(exchange, localTimestamp));
            const mappers = createMappers(new Date());
            const filters = handy_1.getFilters(mappers, symbols);
            const messages = _stream({
                exchange,
                withDisconnects: true,
                timeoutIntervalMS,
                filters,
                onError
            });
            // filter normalized messages by symbol as some exchanges do not offer subscribing to specific symbols for some of the channels
            // for example Phemex market24h channel
            const filter = (symbol) => {
                return symbols === undefined || symbols.length === 0 || symbols.includes(symbol);
            };
            const normalizedMessages = handy_1.normalizeMessages(exchange, messages, mappers, createMappers, withDisconnectMessages, filter, new Date());
            for await (const message of normalizedMessages) {
                yield message;
            }
        }
        catch (error) {
            if (onError !== undefined) {
                onError(error);
            }
            debug_1.debug('%s normalize messages error: %o, retrying with new connection...', exchange, error);
            if (withDisconnectMessages) {
                // yield it as disconnect as well if flag is set
                const disconnect = {
                    type: 'disconnect',
                    exchange,
                    localTimestamp: new Date()
                };
                yield disconnect;
            }
        }
    }
}
function validateStreamOptions(filters) {
    if (!filters) {
        throw new Error(`Invalid "filters" argument. Please provide filters array`);
    }
    for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        if (filter.symbols && Array.isArray(filter.symbols) === false) {
            throw new Error(`Invalid "filters[].symbols" argument: ${filter.symbols}. Please provide array of symbol strings`);
        }
    }
}
function streamNormalized({ exchange, symbols, timeoutIntervalMS = 10000, withDisconnectMessages = undefined, onError = undefined }, ...normalizers) {
    let _iterator = _streamNormalized({ exchange, symbols, timeoutIntervalMS, withDisconnectMessages, onError }, ...normalizers);
    _iterator.__realtime__ = true;
    return _iterator;
}
exports.streamNormalized = streamNormalized;
//# sourceMappingURL=stream.js.map