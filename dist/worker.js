"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = require("fs-extra");
const p_map_1 = __importDefault(require("p-map"));
const worker_threads_1 = require("worker_threads");
const handy_1 = require("./handy");
const debug = debug_1.default('maidenlane-dev');
if (worker_threads_1.isMainThread) {
    debug('existing, worker is not meant to run in main thread');
}
else {
    worker_threads_1.parentPort.on('message', (signal) => {
        if (signal === "BEFORE_TERMINATE" /* BEFORE_TERMINATE */) {
            handy_1.cleanTempFiles();
            worker_threads_1.parentPort.postMessage("READY_TO_TERMINATE" /* READY_TO_TERMINATE */);
        }
    });
    getDataFeedSlices(worker_threads_1.workerData);
}
process.on('unhandledRejection', (err, promise) => {
    debug('Unhandled Rejection at: %o, reason: %o', promise, err);
    throw err;
});
async function getDataFeedSlices(payload) {
    const MILLISECONDS_IN_MINUTE = 60 * 1000;
    const CONCURRENCY_LIMIT = 60;
    // deduplicate filters (if the channel was provided multiple times)
    const filters = handy_1.optimizeFilters(payload.filters);
    // let's calculate number of minutes between "from" and "to" dates as those will give us total number of requests or checks
    // that will have to be performed concurrently with CONCURRENCY_LIMIT
    const minutesCountToFetch = Math.floor((payload.toDate.getTime() - payload.fromDate.getTime()) / MILLISECONDS_IN_MINUTE);
    // each filter will have separate sub dir based on it's sha hash
    const cacheDir = `${payload.cacheDir}/feeds/${payload.exchange}/${handy_1.sha256(filters)}`;
    const waitOffsetMS = typeof payload.waitWhenDataNotYetAvailable === 'number'
        ? payload.waitWhenDataNotYetAvailable * MILLISECONDS_IN_MINUTE
        : 30 * MILLISECONDS_IN_MINUTE;
    if (payload.waitWhenDataNotYetAvailable !== undefined && payload.toDate.valueOf() > new Date().valueOf() - waitOffsetMS) {
        let timestampForLastAvailableData = new Date().valueOf() - waitOffsetMS;
        // in case when even initial from date is not yet available wait until it is
        if (timestampForLastAvailableData < payload.fromDate.valueOf()) {
            const initialWaitTime = payload.fromDate.valueOf() - timestampForLastAvailableData;
            if (initialWaitTime > 0) {
                await handy_1.wait(initialWaitTime);
            }
        }
        // fetch concurently any data that is already available
        timestampForLastAvailableData = new Date().valueOf() - waitOffsetMS;
        const minutesCountThatAreAlreadyAvailableToFetch = Math.floor((timestampForLastAvailableData - payload.fromDate.valueOf()) / MILLISECONDS_IN_MINUTE);
        await p_map_1.default(handy_1.sequence(minutesCountThatAreAlreadyAvailableToFetch, 0), (offset) => getDataFeedSlice(payload, offset, filters, cacheDir), {
            concurrency: CONCURRENCY_LIMIT
        });
        // for remaining data iterate one by one and wait as needed
        for (let offset = minutesCountThatAreAlreadyAvailableToFetch; offset < minutesCountToFetch; offset++) {
            const timestampToFetch = payload.fromDate.valueOf() + offset * MILLISECONDS_IN_MINUTE;
            timestampForLastAvailableData = new Date().valueOf() - waitOffsetMS;
            if (timestampToFetch > timestampForLastAvailableData) {
                await handy_1.wait(MILLISECONDS_IN_MINUTE);
            }
            await getDataFeedSlice(payload, offset, filters, cacheDir);
        }
    }
    else {
        // fetch last slice - it will tell us if user has access to the end of requested date range and data is available
        await getDataFeedSlice(payload, minutesCountToFetch - 1, filters, cacheDir);
        // fetch first slice - it will tell us if user has access to the beginning of requested date range
        await getDataFeedSlice(payload, 0, filters, cacheDir);
        // it both begining and end date of the range is accessible fetch all remaning slices concurently with CONCURRENCY_LIMIT
        await p_map_1.default(handy_1.sequence(minutesCountToFetch, 1), // this will produce Iterable sequence from 1 to minutesCountToFetch
        (offset) => getDataFeedSlice(payload, offset, filters, cacheDir), { concurrency: CONCURRENCY_LIMIT });
    }
}
async function getDataFeedSlice({ exchange, fromDate, endpoint, apiKey, userAgent }, offset, filters, cacheDir) {
    const sliceTimestamp = handy_1.addMinutes(fromDate, offset);
    const sliceKey = sliceTimestamp.toISOString();
    const slicePath = `${cacheDir}/${handy_1.formatDateToPath(sliceTimestamp)}.json.gz`;
    const isCached = fs_extra_1.existsSync(slicePath);
    let url = `${endpoint}/data-feeds/${exchange}?from=${fromDate.toISOString()}&offset=${offset}`;
    if (filters.length > 0) {
        url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    if (!isCached) {
        await handy_1.download({
            apiKey,
            downloadPath: slicePath,
            url,
            userAgent
        });
        debug('getDataFeedSlice fetched from API and cached, %s', sliceKey);
    }
    else {
        debug('getDataFeedSlice already cached: %s', sliceKey);
    }
    // everything went well (already cached or successfull cached) let's communicate it to parent thread
    const message = {
        sliceKey,
        slicePath
    };
    worker_threads_1.parentPort.postMessage(message);
}
//# sourceMappingURL=worker.js.map