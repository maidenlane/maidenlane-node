"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combine = void 0;
const stream_1 = require("stream");
const events_1 = require("events");
const DATE_MAX = new Date(8640000000000000);
async function nextWithIndex(iterator, index) {
    const result = await iterator.next();
    return {
        result,
        index
    };
}
function findOldestResult(oldest, current) {
    if (oldest.result.done) {
        return oldest;
    }
    if (current.result.done) {
        return current;
    }
    const currentTimestamp = current.result.value.localTimestamp.valueOf();
    const oldestTimestamp = oldest.result.value.localTimestamp.valueOf();
    if (currentTimestamp < oldestTimestamp) {
        return current;
    }
    if (currentTimestamp === oldestTimestamp) {
        const currentTimestampMicroSeconds = current.result.value.localTimestamp.μs || 0;
        const oldestTimestampMicroSeconds = oldest.result.value.localTimestamp.μs || 0;
        if (currentTimestampMicroSeconds < oldestTimestampMicroSeconds) {
            return current;
        }
    }
    return oldest;
}
// combines multiple iterators from for example multiple exchanges
// works both for real-time and historical data
async function* combine(...iterators) {
    if (iterators.length === 0) {
        return;
    }
    // decide based on first provided iterator if we're dealing with real-time or historical data streams
    if (iterators[0].__realtime__) {
        const combinedStream = new stream_1.PassThrough({
            objectMode: true,
            highWaterMark: 8096
        });
        iterators.forEach(async function writeMessagesToCombinedStream(messages) {
            for await (const message of messages) {
                if (combinedStream.destroyed) {
                    return;
                }
                if (!combinedStream.write(message)) {
                    // Handle backpressure on write
                    await events_1.once(combinedStream, 'drain');
                }
            }
        });
        for await (const message of combinedStream) {
            yield message;
        }
    }
    else {
        return yield* combineHistorical(iterators);
    }
}
exports.combine = combine;
async function* combineHistorical(iterators) {
    // wait for all results to resolve
    const results = await Promise.all(iterators.map(nextWithIndex));
    let aliveIteratorsCount = results.length;
    do {
        // if we're deailing with historical data replay
        // and need to return combined messages iterable sorted by local timestamp in acending order
        // find resolved one that is the 'oldest'
        const oldestResult = results.reduce(findOldestResult, results[0]);
        const { result, index } = oldestResult;
        if (result.done) {
            aliveIteratorsCount--;
            // we don't want finished iterators to every be considered 'oldest' again
            // hence provide them with result that has local timestamp set to DATE_MAX
            // and that is not done
            results[index].result = {
                done: false,
                value: {
                    localTimestamp: DATE_MAX
                }
            };
        }
        else {
            // yield oldest value and replace with next value from iterable for given index
            yield result.value;
            results[index] = await nextWithIndex(iterators[index], index);
        }
    } while (aliveIteratorsCount > 0);
}
//# sourceMappingURL=combine.js.map