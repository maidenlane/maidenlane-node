"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalPlaces = exports.CappedSet = exports.CircularBuffer = exports.cleanTempFiles = exports.download = exports.optimizeFilters = exports.parseμs = exports.batch = exports.getFilters = exports.normalizeMessages = exports.take = exports.HttpError = exports.ONE_SEC_IN_MS = exports.sequence = exports.addDays = exports.addMinutes = exports.sha256 = exports.doubleDigit = exports.formatDateToPath = exports.wait = exports.parseAsUTCDate = void 0;
const crypto_1 = __importStar(require("crypto"));
const fs_extra_1 = require("fs-extra");
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const debug_1 = require("./debug");
function parseAsUTCDate(val) {
    // not sure about this one, but it should force parsing date as UTC date not as local timezone
    if (val.endsWith('Z') === false) {
        val += 'Z';
    }
    var date = new Date(val);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes()));
}
exports.parseAsUTCDate = parseAsUTCDate;
function wait(delayMS) {
    return new Promise((resolve) => {
        setTimeout(resolve, delayMS);
    });
}
exports.wait = wait;
function formatDateToPath(date) {
    const year = date.getUTCFullYear();
    const month = doubleDigit(date.getUTCMonth() + 1);
    const day = doubleDigit(date.getUTCDate());
    const hour = doubleDigit(date.getUTCHours());
    const minute = doubleDigit(date.getUTCMinutes());
    return `${year}/${month}/${day}/${hour}/${minute}`;
}
exports.formatDateToPath = formatDateToPath;
function doubleDigit(input) {
    return input < 10 ? '0' + input : '' + input;
}
exports.doubleDigit = doubleDigit;
function sha256(obj) {
    return crypto_1.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}
exports.sha256 = sha256;
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}
exports.addMinutes = addMinutes;
function addDays(date, days) {
    return new Date(date.getTime() + days * 60000 * 1440);
}
exports.addDays = addDays;
function* sequence(end, seed = 0) {
    let current = seed;
    while (current < end) {
        yield current;
        current += 1;
    }
    return;
}
exports.sequence = sequence;
exports.ONE_SEC_IN_MS = 1000;
class HttpError extends Error {
    constructor(status, responseText, url) {
        super(`HttpError: status code: ${status}, response text: ${responseText}`);
        this.status = status;
        this.responseText = responseText;
        this.url = url;
    }
}
exports.HttpError = HttpError;
function* take(iterable, length) {
    if (length === 0) {
        return;
    }
    for (const item of iterable) {
        yield item;
        length--;
        if (length === 0) {
            return;
        }
    }
}
exports.take = take;
async function* normalizeMessages(exchange, messages, mappers, createMappers, withDisconnectMessages, filter, currentTimestamp) {
    let previousLocalTimestamp = currentTimestamp;
    let mappersForExchange = mappers;
    if (mappersForExchange.length === 0) {
        throw new Error(`Can't normalize data without any normalizers provided`);
    }
    for await (const messageWithTimestamp of messages) {
        if (messageWithTimestamp === undefined) {
            // we received undefined meaning Websocket disconnection
            // lets create new mappers with clean state for 'new connection'
            mappersForExchange = undefined;
            // if flag withDisconnectMessages is set, yield disconnect message
            if (withDisconnectMessages === true && previousLocalTimestamp !== undefined) {
                const disconnect = {
                    type: 'disconnect',
                    exchange,
                    localTimestamp: previousLocalTimestamp
                };
                yield disconnect;
            }
            continue;
        }
        if (mappersForExchange === undefined) {
            mappersForExchange = createMappers(messageWithTimestamp.localTimestamp);
        }
        previousLocalTimestamp = messageWithTimestamp.localTimestamp;
        for (const mapper of mappersForExchange) {
            if (mapper.canHandle(messageWithTimestamp.message)) {
                const mappedMessages = mapper.map(messageWithTimestamp.message, messageWithTimestamp.localTimestamp);
                if (!mappedMessages) {
                    continue;
                }
                for (const message of mappedMessages) {
                    if (filter === undefined) {
                        yield message;
                    }
                    else if (filter(message.symbol)) {
                        yield message;
                    }
                }
            }
        }
    }
}
exports.normalizeMessages = normalizeMessages;
function getFilters(mappers, symbols) {
    const filters = mappers.flatMap((mapper) => mapper.getFilters(symbols));
    const deduplicatedFilters = filters.reduce((prev, current) => {
        const matchingExisting = prev.find((c) => c.channel === current.channel);
        if (matchingExisting !== undefined) {
            if (matchingExisting.symbols !== undefined && current.symbols) {
                for (let symbol of current.symbols) {
                    if (matchingExisting.symbols.includes(symbol) === false) {
                        matchingExisting.symbols.push(symbol);
                    }
                }
            }
            else if (current.symbols) {
                matchingExisting.symbols = [...current.symbols];
            }
        }
        else {
            prev.push(current);
        }
        return prev;
    }, []);
    return deduplicatedFilters;
}
exports.getFilters = getFilters;
function* batch(symbols, batchSize) {
    for (let i = 0; i < symbols.length; i += batchSize) {
        yield symbols.slice(i, i + batchSize);
    }
}
exports.batch = batch;
function parseμs(dateString) {
    // check if we have ISO 8601 format date string, e.g: 2019-06-01T00:03:03.1238784Z or 2020-07-22T00:09:16.836773Z
    // or 2020-03-01T00:00:24.893456+00:00
    if (dateString.length === 27 || dateString.length === 28 || dateString.length === 32) {
        return Number(dateString.slice(23, 26));
    }
    return 0;
}
exports.parseμs = parseμs;
function optimizeFilters(filters) {
    // deduplicate filters (if the channel was provided multiple times)
    const optimizedFilters = filters.reduce((prev, current) => {
        const matchingExisting = prev.find((c) => c.channel === current.channel);
        if (matchingExisting) {
            // both previous and current have symbols let's merge them
            if (matchingExisting.symbols && current.symbols) {
                matchingExisting.symbols.push(...current.symbols);
            }
            else if (current.symbols) {
                matchingExisting.symbols = [...current.symbols];
            }
        }
        else {
            prev.push(current);
        }
        return prev;
    }, []);
    // sort filters in place to improve local disk cache ratio (no matter filters order if the same filters are provided will hit the cache)
    optimizedFilters.sort((f1, f2) => {
        if (f1.channel < f2.channel) {
            return -1;
        }
        if (f1.channel > f2.channel) {
            return 1;
        }
        return 0;
    });
    // sort and deduplicate filters symbols
    optimizedFilters.forEach((filter) => {
        if (filter.symbols) {
            filter.symbols = [...new Set(filter.symbols)].sort();
        }
    });
    return optimizedFilters;
}
exports.optimizeFilters = optimizeFilters;
const httpsAgent = new https_1.default.Agent({
    keepAlive: true,
    keepAliveMsecs: 10 * exports.ONE_SEC_IN_MS,
    maxSockets: 120
});
async function download({ apiKey, downloadPath, url, userAgent }) {
    const httpRequestOptions = {
        agent: httpsAgent,
        timeout: 90 * exports.ONE_SEC_IN_MS,
        headers: {
            'Accept-Encoding': 'gzip',
            'User-Agent': userAgent,
            Authorization: apiKey ? `Bearer ${apiKey}` : ''
        }
    };
    const MAX_ATTEMPTS = 8;
    let attempts = 0;
    while (true) {
        // simple retry logic when fetching from the network...
        attempts++;
        try {
            return await _downloadFile(httpRequestOptions, url, downloadPath);
        }
        catch (error) {
            const badOrUnauthorizedRequest = error instanceof HttpError && (error.status === 400 || error.status === 401);
            const tooManyRequests = error instanceof HttpError && error.status === 429;
            // do not retry when we've got bad or unauthorized request or enough attempts
            if (badOrUnauthorizedRequest || attempts === MAX_ATTEMPTS) {
                throw error;
            }
            const randomIngridient = Math.random() * 500;
            const attemptsDelayMS = Math.pow(2, attempts) * exports.ONE_SEC_IN_MS;
            let nextAttemptDelayMS = randomIngridient + attemptsDelayMS;
            if (tooManyRequests) {
                // when too many requests received wait longer
                nextAttemptDelayMS += 3 * exports.ONE_SEC_IN_MS * attempts;
            }
            debug_1.debug('download file error: %o, next attempt delay: %d, url %s, path: %s', error, nextAttemptDelayMS, url, downloadPath);
            await wait(nextAttemptDelayMS);
        }
    }
}
exports.download = download;
const tmpFileCleanups = new Map();
function cleanTempFiles() {
    tmpFileCleanups.forEach((cleanup) => cleanup());
}
exports.cleanTempFiles = cleanTempFiles;
async function _downloadFile(requestOptions, url, downloadPath) {
    // first ensure that directory where we want to download file exists
    fs_extra_1.ensureDirSync(path_1.default.dirname(downloadPath));
    // create write file stream that we'll write data into - first as unconfirmed temp file
    const tmpFilePath = `${downloadPath}${crypto_1.default.randomBytes(8).toString('hex')}.unconfirmed`;
    const fileWriteStream = fs_extra_1.createWriteStream(tmpFilePath);
    const cleanup = () => {
        try {
            fileWriteStream.destroy();
            fs_extra_1.removeSync(tmpFilePath);
        }
        catch { }
    };
    tmpFileCleanups.set(tmpFilePath, cleanup);
    try {
        // based on https://github.com/nodejs/node/issues/28172 - only reliable way to consume response stream and avoiding all the 'gotchas'
        await new Promise((resolve, reject) => {
            const req = https_1.default
                .get(url, requestOptions, (res) => {
                const { statusCode } = res;
                if (statusCode !== 200) {
                    // read the error response text and throw it as an HttpError
                    res.setEncoding('utf8');
                    let body = '';
                    res.on('error', reject);
                    res.on('data', (chunk) => (body += chunk));
                    res.on('end', () => {
                        reject(new HttpError(statusCode, body, url));
                    });
                }
                else {
                    // consume the response stream by writing it to the file
                    res
                        .on('error', reject)
                        .on('aborted', () => reject(new Error('Request aborted')))
                        .pipe(fileWriteStream)
                        .on('error', reject)
                        .on('finish', () => {
                        if (res.complete) {
                            resolve();
                        }
                        else {
                            reject(new Error('The connection was terminated while the message was still being sent'));
                        }
                    });
                }
            })
                .on('error', reject)
                .on('timeout', () => {
                debug_1.debug('download file request timeout, %s', url);
                req.abort();
            });
        });
        // finally when saving from the network to file has succeded, rename tmp file to normal name
        // then we're sure that responses is 100% saved and also even if different process was doing the same we're good
        await fs_extra_1.rename(tmpFilePath, downloadPath);
    }
    finally {
        tmpFileCleanups.delete(tmpFilePath);
        cleanup();
    }
}
class CircularBuffer {
    constructor(_bufferSize) {
        this._bufferSize = _bufferSize;
        this._buffer = [];
        this._index = 0;
    }
    append(value) {
        const isFull = this._buffer.length === this._bufferSize;
        let poppedValue;
        if (isFull) {
            poppedValue = this._buffer[this._index];
        }
        this._buffer[this._index] = value;
        this._index = (this._index + 1) % this._bufferSize;
        return poppedValue;
    }
    *items() {
        for (let i = 0; i < this._buffer.length; i++) {
            const index = (this._index + i) % this._buffer.length;
            yield this._buffer[index];
        }
    }
    get count() {
        return this._buffer.length;
    }
    clear() {
        this._buffer = [];
        this._index = 0;
    }
}
exports.CircularBuffer = CircularBuffer;
class CappedSet {
    constructor(_maxSize) {
        this._maxSize = _maxSize;
        this._set = new Set();
    }
    has(value) {
        return this._set.has(value);
    }
    add(value) {
        if (this._set.size >= this._maxSize) {
            this._set.delete(this._set.keys().next().value);
        }
        this._set.add(value);
    }
    remove(value) {
        this._set.delete(value);
    }
    size() {
        return this._set.size;
    }
}
exports.CappedSet = CappedSet;
function hasFraction(n) {
    return Math.abs(Math.round(n) - n) > 1e-10;
}
// https://stackoverflow.com/a/44815797
function decimalPlaces(n) {
    let count = 0;
    // multiply by increasing powers of 10 until the fractional part is ~ 0
    while (hasFraction(n * 10 ** count) && isFinite(10 ** count))
        count++;
    return count;
}
exports.decimalPlaces = decimalPlaces;
//# sourceMappingURL=handy.js.map