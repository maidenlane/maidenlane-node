"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolingClientBase = exports.MultiConnectionRealTimeFeedBase = exports.RealTimeFeedBase = void 0;
const debug_1 = __importDefault(require("debug"));
const ws_1 = __importDefault(require("ws"));
const stream_1 = require("stream");
const events_1 = require("events");
const handy_1 = require("../handy");
let connectionCounter = 1;
class RealTimeFeedBase {
    constructor(_exchange, filters, _timeoutIntervalMS, _onError) {
        this._exchange = _exchange;
        this._timeoutIntervalMS = _timeoutIntervalMS;
        this._onError = _onError;
        this.throttleSubscribeMS = 0;
        this.manualSnapshotsBuffer = [];
        this._receivedMessagesCount = 0;
        this._connectionId = connectionCounter++;
        this._onConnectionEstabilished = async () => {
            try {
                const subscribeMessages = this.mapToSubscribeMessages(this._filters);
                let symbolsCount = this._filters.reduce((prev, curr) => {
                    if (curr.symbols !== undefined) {
                        for (const symbol of curr.symbols) {
                            prev.add(symbol);
                        }
                    }
                    return prev;
                }, new Set()).size;
                for (const message of subscribeMessages) {
                    this.send(message);
                    if (this.throttleSubscribeMS > 0) {
                        await handy_1.wait(this.throttleSubscribeMS);
                    }
                }
                this.debug('(connection id: %d) estabilished connection', this._connectionId);
                this.onConnected();
                //wait before fetching snapshots until we're sure we've got proper connection estabilished (received some messages)
                while (this._receivedMessagesCount < symbolsCount * 2) {
                    await handy_1.wait(100);
                }
                // wait a second just in case before starting fetching the snapshots
                await handy_1.wait(1 * handy_1.ONE_SEC_IN_MS);
                if (this._ws.readyState === ws_1.default.CLOSED) {
                    return;
                }
                await this.provideManualSnapshots(this._filters, () => this._ws.readyState === ws_1.default.CLOSED);
            }
            catch (e) {
                this.debug('(connection id: %d) providing manual snapshots error: %o', this._connectionId, e);
                this._ws.emit('error', e);
            }
        };
        this._onConnectionClosed = (event) => {
            this.debug('(connection id: %d) connection closed %s', this._connectionId, event.reason);
        };
        this._filters = handy_1.optimizeFilters(filters);
        this.debug = debug_1.default(`maidenlane-dev:realtime:${_exchange}`);
    }
    [Symbol.asyncIterator]() {
        return this._stream();
    }
    async *_stream() {
        let staleConnectionTimerId;
        let pingTimerId;
        let retries = 0;
        while (true) {
            try {
                const subscribeMessages = this.mapToSubscribeMessages(this._filters);
                this.debug('(connection id: %d) estabilishing connection to %s', this._connectionId, this.wssURL);
                this.debug('(connection id: %d) provided filters: %o mapped to subscribe messages: %o', this._connectionId, this._filters, subscribeMessages);
                this._ws = new ws_1.default(this.wssURL, { perMessageDeflate: false, handshakeTimeout: 10 * handy_1.ONE_SEC_IN_MS });
                this._ws.onopen = this._onConnectionEstabilished;
                this._ws.onclose = this._onConnectionClosed;
                staleConnectionTimerId = this._monitorConnectionIfStale();
                pingTimerId = this._sendPeriodicPing();
                const realtimeMessagesStream = ws_1.default.createWebSocketStream(this._ws, {
                    readableObjectMode: true,
                    readableHighWaterMark: 8096 // since we're in object mode, let's increase hwm a little from default of 16 messages buffered
                });
                for await (let message of realtimeMessagesStream) {
                    if (this.decompress !== undefined) {
                        message = this.decompress(message);
                    }
                    const messageDeserialized = JSON.parse(message);
                    if (this.messageIsError(messageDeserialized)) {
                        throw new Error(`Received error message:${message.toString()}`);
                    }
                    // exclude heaartbeat messages from  received messages counter
                    // connection could still be stale even if only heartbeats are provided without any data
                    if (this.messageIsHeartbeat(messageDeserialized) === false) {
                        this._receivedMessagesCount++;
                    }
                    this.onMessage(messageDeserialized);
                    yield messageDeserialized;
                    if (retries > 0) {
                        // reset retries counter as we've received correct message from the connection
                        retries = 0;
                    }
                    if (this.manualSnapshotsBuffer.length > 0) {
                        for (let snapshot of this.manualSnapshotsBuffer) {
                            yield snapshot;
                        }
                        this.manualSnapshotsBuffer.length = 0;
                    }
                }
                // clear monitoring connection timer and notify about disconnect
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                yield undefined;
            }
            catch (error) {
                if (this._onError !== undefined) {
                    this._onError(error);
                }
                retries++;
                const MAX_DELAY = 16 * 1000;
                const isRateLimited = error.message.includes('429');
                let delay;
                if (isRateLimited) {
                    delay = MAX_DELAY * retries;
                }
                else {
                    delay = Math.pow(2, retries - 1) * 1000;
                    if (delay > MAX_DELAY) {
                        delay = MAX_DELAY;
                    }
                }
                this.debug('(connection id: %d) %s real-time feed connection error, retries count: %d, next retry delay: %dms, rate limited: %s error message: %o', this._connectionId, this._exchange, retries, delay, isRateLimited, error);
                // clear monitoring connection timer and notify about disconnect
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                yield undefined;
                await handy_1.wait(delay);
            }
            finally {
                // stop timers
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                if (pingTimerId !== undefined) {
                    clearInterval(pingTimerId);
                }
            }
        }
    }
    send(msg) {
        if (this._ws === undefined) {
            return;
        }
        if (this._ws.readyState !== ws_1.default.OPEN) {
            return;
        }
        this._ws.send(JSON.stringify(msg));
    }
    messageIsHeartbeat(_msg) {
        return false;
    }
    async provideManualSnapshots(_filters, _shouldCancel) { }
    onMessage(_msg) { }
    onConnected() { }
    _monitorConnectionIfStale() {
        if (this._timeoutIntervalMS === undefined || this._timeoutIntervalMS === 0) {
            return;
        }
        // set up timer that checks against open, but stale connections that do not return any data
        return setInterval(() => {
            if (this._ws === undefined) {
                return;
            }
            if (this._receivedMessagesCount === 0) {
                this.debug('(connection id: %d) did not received any messages within %d ms timeout, terminating connection...', this._connectionId, this._timeoutIntervalMS);
                this._ws.terminate();
            }
            this._receivedMessagesCount = 0;
        }, this._timeoutIntervalMS);
    }
    _sendPeriodicPing() {
        return setInterval(() => {
            if (this._ws === undefined || this._ws.readyState !== ws_1.default.OPEN) {
                return;
            }
            this._ws.ping();
        }, 5 * handy_1.ONE_SEC_IN_MS);
    }
}
exports.RealTimeFeedBase = RealTimeFeedBase;
class MultiConnectionRealTimeFeedBase {
    constructor(_exchange, _filters, _timeoutIntervalMS, _onError) {
        this._exchange = _exchange;
        this._filters = _filters;
        this._timeoutIntervalMS = _timeoutIntervalMS;
        this._onError = _onError;
    }
    [Symbol.asyncIterator]() {
        return this._stream();
    }
    async *_stream() {
        const combinedStream = new stream_1.PassThrough({
            objectMode: true,
            highWaterMark: 8096
        });
        const realTimeFeeds = this._getRealTimeFeeds(this._exchange, this._filters, this._timeoutIntervalMS, this._onError);
        for (const realTimeFeed of realTimeFeeds) {
            // iterate over separate real-time feeds and write their messages into combined stream
            ;
            (async function writeMessagesToCombinedStream() {
                for await (const message of realTimeFeed) {
                    if (combinedStream.destroyed) {
                        return;
                    }
                    if (!combinedStream.write(message))
                        // Handle backpressure on write
                        await events_1.once(combinedStream, 'drain');
                }
            })();
        }
        for await (const message of combinedStream) {
            yield message;
        }
    }
}
exports.MultiConnectionRealTimeFeedBase = MultiConnectionRealTimeFeedBase;
class PoolingClientBase {
    constructor(exchange, _poolingIntervalSeconds) {
        this._poolingIntervalSeconds = _poolingIntervalSeconds;
        this._tid = undefined;
        this.debug = debug_1.default(`maidenlane-dev:pooling-client:${exchange}`);
    }
    [Symbol.asyncIterator]() {
        return this._stream();
    }
    async _startPooling(outputStream) {
        const timeoutInterval = this._poolingIntervalSeconds * handy_1.ONE_SEC_IN_MS;
        const pool = async () => {
            try {
                await this.poolDataToStream(outputStream);
            }
            catch (e) {
                this.debug('pooling error %o', e);
            }
        };
        const poolAndSchedule = () => {
            pool().then(() => {
                if (!outputStream.destroyed) {
                    this._tid = setTimeout(poolAndSchedule, timeoutInterval);
                }
            });
        };
        poolAndSchedule();
    }
    async *_stream() {
        const stream = new stream_1.PassThrough({
            objectMode: true,
            highWaterMark: 1024
        });
        this._startPooling(stream);
        this.debug('pooling started');
        try {
            for await (const message of stream) {
                yield message;
            }
        }
        finally {
            if (this._tid !== undefined) {
                clearInterval(this._tid);
            }
            this.debug('pooling finished');
        }
    }
}
exports.PoolingClientBase = PoolingClientBase;
//# sourceMappingURL=realtimefeed.js.map