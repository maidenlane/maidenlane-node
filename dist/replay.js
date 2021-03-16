"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replayNormalized = exports.replay = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
const zlib_1 = require("zlib");
const binarysplit_1 = require("./binarysplit");
const consts_1 = require("./consts");
const debug_1 = require("./debug");
const handy_1 = require("./handy");
const mappers_1 = require("./mappers");
const options_1 = require("./options");
const clearcache_1 = require("./clearcache");
async function* replay({ exchange, from, to, filters, skipDecoding = undefined, withDisconnects = undefined, apiKey = undefined, withMicroseconds = undefined, autoCleanup = undefined, waitWhenDataNotYetAvailable = undefined }) {
    validateReplayOptions(exchange, from, to, filters);
    const fromDate = handy_1.parseAsUTCDate(from);
    const toDate = handy_1.parseAsUTCDate(to);
    const cachedSlicePaths = new Map();
    let replayError;
    debug_1.debug('replay for exchange: %s started - from: %s, to: %s, filters: %o', exchange, fromDate.toISOString(), toDate.toISOString(), filters);
    const options = options_1.getOptions();
    // initialize worker thread that will fetch and cache data feed slices and "report back" by setting proper key/values in cachedSlicePaths
    const payload = {
        cacheDir: options.cacheDir,
        endpoint: options.endpoint,
        apiKey: apiKey || options.apiKey,
        userAgent: options._userAgent,
        fromDate,
        toDate,
        exchange,
        filters: filters || [],
        waitWhenDataNotYetAvailable
    };
    const worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker.js'), {
        workerData: payload
    });
    worker.on('message', (message) => {
        cachedSlicePaths.set(message.sliceKey, message.slicePath);
    });
    worker.on('error', (err) => {
        debug_1.debug('worker error %o', err);
        replayError = err;
    });
    worker.on('exit', (code) => {
        debug_1.debug('worker finished with code: %d', code);
    });
    try {
        // date is always formatted to have length of 28 so we can skip looking for first space in line and use it
        // as hardcoded value
        const DATE_MESSAGE_SPLIT_INDEX = 28;
        // experimental more lenient gzip decompression, behind env flag for now
        // see https://github.com/request/request/pull/2492 and https://github.com/node-fetch/node-fetch/pull/239
        const ZLIB_OPTIONS = process.env.TARDIS_LENIENT_GZIP_DECOMPRESS
            ? {
                chunkSize: 128 * 1024,
                flush: zlib_1.constants.Z_SYNC_FLUSH,
                finishFlush: zlib_1.constants.Z_SYNC_FLUSH
            }
            : { chunkSize: 128 * 1024 };
        // helper flag that helps us not yielding two subsequent undefined/disconnect messages
        let lastMessageWasUndefined = false;
        let currentSliceDate = new Date(fromDate);
        // iterate over every minute in <=from,to> date range
        // get cached slice paths, read them as file streams, decompress, split by new lines and yield as messages
        while (currentSliceDate < toDate) {
            const sliceKey = currentSliceDate.toISOString();
            debug_1.debug('getting slice: %s, exchange: %s', sliceKey, exchange);
            let cachedSlicePath;
            while (cachedSlicePath === undefined) {
                cachedSlicePath = cachedSlicePaths.get(sliceKey);
                // if something went wrong(network issue, auth issue, gunzip issue etc)
                if (replayError !== undefined) {
                    throw replayError;
                }
                if (cachedSlicePath === undefined) {
                    // if response for requested date is not ready yet wait 100ms and try again
                    debug_1.debug('waiting for slice: %s, exchange: %s', sliceKey, exchange);
                    await handy_1.wait(100);
                }
            }
            // response is a path to file on disk let' read it as stream
            const linesStream = fs_extra_1.createReadStream(cachedSlicePath, { highWaterMark: 128 * 1024 })
                // unzip it
                .pipe(zlib_1.createGunzip(ZLIB_OPTIONS))
                .on('error', function onGunzipError(err) {
                debug_1.debug('gunzip error %o', err);
                linesStream.destroy(err);
            })
                // and split by new line
                .pipe(new binarysplit_1.BinarySplitStream())
                .on('error', function onBinarySplitStreamError(err) {
                debug_1.debug('binary split stream error %o', err);
                linesStream.destroy(err);
            });
            let linesCount = 0;
            for await (const bufferLine of linesStream) {
                linesCount++;
                if (bufferLine.length > 0) {
                    lastMessageWasUndefined = false;
                    const localTimestampBuffer = bufferLine.slice(0, DATE_MESSAGE_SPLIT_INDEX);
                    const messageBuffer = bufferLine.slice(DATE_MESSAGE_SPLIT_INDEX + 1);
                    // as any due to https://github.com/Microsoft/TypeScript/issues/24929
                    if (skipDecoding === true) {
                        yield {
                            localTimestamp: localTimestampBuffer,
                            message: messageBuffer
                        };
                    }
                    else {
                        const message = JSON.parse(messageBuffer);
                        const localTimestampString = localTimestampBuffer.toString();
                        const localTimestamp = new Date(localTimestampString);
                        if (withMicroseconds) {
                            // provide additionally fractions of millisecond at microsecond resolution
                            // local timestamp always has format like this 2019-06-01T00:03:03.1238784Z
                            localTimestamp.μs = handy_1.parseμs(localTimestampString);
                        }
                        yield {
                            // when skipDecoding is not set, decode timestamp to Date and message to object
                            localTimestamp,
                            message
                        };
                    }
                    // ignore empty lines unless withDisconnects is set to true
                    // do not yield subsequent undefined messages
                }
                else if (withDisconnects === true && lastMessageWasUndefined === false) {
                    lastMessageWasUndefined = true;
                    yield undefined;
                }
            }
            debug_1.debug('processed slice: %s, exchange: %s, count: %d', sliceKey, exchange, linesCount);
            // remove slice key from the map as it's already processed
            cachedSlicePaths.delete(sliceKey);
            // move one minute forward
            currentSliceDate.setUTCMinutes(currentSliceDate.getUTCMinutes() + 1);
        }
        debug_1.debug('replay for exchange: %s finished - from: %s, to: %s, filters: %o', exchange, fromDate.toISOString(), toDate.toISOString(), filters);
    }
    finally {
        if (autoCleanup) {
            debug_1.debug('replay for exchange %s auto cleanup started - from: %s, to: %s, filters: %o', exchange, fromDate.toISOString(), toDate.toISOString(), filters);
            let startDate = new Date(fromDate);
            while (startDate < toDate) {
                clearcache_1.clearCacheSync(exchange, filters, startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, startDate.getUTCDate());
                startDate = handy_1.addDays(startDate, 1);
            }
            debug_1.debug('replay for exchange %s auto cleanup finished - from: %s, to: %s, filters: %o', exchange, fromDate.toISOString(), toDate.toISOString(), filters);
        }
        await terminateWorker(worker, 500);
    }
}
exports.replay = replay;
// gracefully terminate worker
async function terminateWorker(worker, waitTimeout) {
    let cancelWait = () => { };
    const maxWaitGuard = new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, waitTimeout);
        cancelWait = () => clearTimeout(timeoutId);
    });
    const readyToTerminate = new Promise((resolve) => {
        worker.once('message', (signal) => signal === "READY_TO_TERMINATE" /* READY_TO_TERMINATE */ && resolve());
    }).then(cancelWait);
    worker.postMessage("BEFORE_TERMINATE" /* BEFORE_TERMINATE */);
    await Promise.race([readyToTerminate, maxWaitGuard]);
    await worker.terminate();
}
function replayNormalized({ exchange, symbols, from, to, withDisconnectMessages = undefined, apiKey = undefined, autoCleanup = undefined, waitWhenDataNotYetAvailable = undefined }, ...normalizers) {
    // mappers assume that symbols are uppercased by default
    // if user by mistake provide lowercase one let's automatically fix it
    if (symbols !== undefined) {
        symbols = symbols.map((s) => s.toUpperCase());
    }
    const fromDate = handy_1.parseAsUTCDate(from);
    validateReplayNormalizedOptions(fromDate, normalizers);
    const createMappers = (localTimestamp) => normalizers.map((m) => m(exchange, localTimestamp));
    const mappers = createMappers(fromDate);
    const filters = handy_1.getFilters(mappers, symbols);
    const messages = replay({
        exchange,
        from,
        to,
        withDisconnects: true,
        filters,
        apiKey,
        withMicroseconds: true,
        autoCleanup,
        waitWhenDataNotYetAvailable
    });
    // filter normalized messages by symbol as some exchanges do not provide server side filtering so we could end up with messages
    // for symbols we've not requested for
    const filter = (symbol) => {
        return symbols === undefined || symbols.length === 0 || symbols.includes(symbol);
    };
    return handy_1.normalizeMessages(exchange, messages, mappers, createMappers, withDisconnectMessages, filter);
}
exports.replayNormalized = replayNormalized;
function validateReplayOptions(exchange, from, to, filters) {
    if (!exchange || consts_1.EXCHANGES.includes(exchange) === false) {
        throw new Error(`Invalid "exchange" argument: ${exchange}. Please provide one of the following exchanges: ${consts_1.EXCHANGES.join(', ')}.`);
    }
    if (!from || isNaN(Date.parse(from))) {
        throw new Error(`Invalid "from" argument: ${from}. Please provide valid date string.`);
    }
    if (!to || isNaN(Date.parse(to))) {
        throw new Error(`Invalid "to" argument: ${to}. Please provide valid date string.`);
    }
    if (handy_1.parseAsUTCDate(to) < handy_1.parseAsUTCDate(from)) {
        throw new Error(`Invalid "to" and "from" arguments combination. Please provide "to" date that is later than "from" date.`);
    }
    if (filters && filters.length > 0) {
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];
            if (!filter.channel || consts_1.EXCHANGE_CHANNELS_INFO[exchange].includes(filter.channel) === false) {
                throw new Error(`Invalid "filters[].channel" argument: ${filter.channel}. Please provide one of the following channels: ${consts_1.EXCHANGE_CHANNELS_INFO[exchange].join(', ')}.`);
            }
            if (filter.symbols && Array.isArray(filter.symbols) === false) {
                throw new Error(`Invalid "filters[].symbols" argument: ${filter.symbols}. Please provide array of symbol strings`);
            }
        }
    }
}
function validateReplayNormalizedOptions(fromDate, normalizers) {
    const hasBookChangeNormalizer = normalizers.some((n) => n === mappers_1.normalizeBookChanges);
    const dateDoesNotStartAtTheBeginningOfTheDay = fromDate.getUTCHours() !== 0 || fromDate.getUTCMinutes() !== 0;
    if (hasBookChangeNormalizer && dateDoesNotStartAtTheBeginningOfTheDay) {
        debug_1.debug('Initial order book snapshots are available only at 00:00 UTC');
    }
}
//# sourceMappingURL=replay.js.map