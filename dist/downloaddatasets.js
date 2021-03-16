"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadDatasets = void 0;
const p_map_1 = __importDefault(require("p-map"));
const debug_1 = require("./debug");
const handy_1 = require("./handy");
const options_1 = require("./options");
const CONCURRENCY_LIMIT = 20;
const MILLISECONDS_IN_SINGLE_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_DOWNLOAD_DIR = './datasets';
const options = options_1.getOptions();
async function downloadDatasets(downloadDatasetsOptions) {
    const { exchange, dataTypes, from, to, symbols } = downloadDatasetsOptions;
    const apiKey = downloadDatasetsOptions.apiKey !== undefined ? downloadDatasetsOptions.apiKey : options.apiKey;
    const downloadDir = downloadDatasetsOptions.downloadDir !== undefined ? downloadDatasetsOptions.downloadDir : DEFAULT_DOWNLOAD_DIR;
    const format = downloadDatasetsOptions.format !== undefined ? downloadDatasetsOptions.format : 'csv';
    const getFilename = downloadDatasetsOptions.getFilename !== undefined ? downloadDatasetsOptions.getFilename : getFilenameDefault;
    // in case someone provided 'api/exchange' symbol, transform it to symbol that is accepted by datasets API
    const datasetsSymbols = symbols.map((s) => s.replace(/\/|:/g, '-').toUpperCase());
    for (const symbol of datasetsSymbols) {
        for (const dataType of dataTypes) {
            const { daysCountToFetch, startDate } = getDownloadDateRange(downloadDatasetsOptions);
            const startTimestamp = new Date().valueOf();
            debug_1.debug('dataset download started for %s %s %s from %s to %s', exchange, dataType, symbol, from, to);
            if (daysCountToFetch > 1) {
                // start with downloading last day of the range, validates is API key has access to the end range of requested data
                await handy_1.download(getDownloadOptions({
                    exchange,
                    symbol,
                    apiKey,
                    downloadDir,
                    dataType,
                    format,
                    getFilename,
                    date: handy_1.addDays(startDate, daysCountToFetch - 1)
                }));
            }
            // then download the first day of the range, validates is API key has access to the start range of requested data
            await handy_1.download(getDownloadOptions({
                exchange,
                symbol,
                apiKey,
                downloadDir,
                dataType,
                format,
                getFilename,
                date: startDate
            }));
            // download the rest concurrently up to the CONCURRENCY_LIMIT
            await p_map_1.default(handy_1.sequence(daysCountToFetch - 1, 1), // this will produce Iterable sequence from 1 to daysCountToFetch - 1 (as we already downloaded data for the first and last day)
            (offset) => handy_1.download(getDownloadOptions({
                exchange,
                symbol,
                apiKey,
                downloadDir,
                dataType,
                format,
                getFilename,
                date: handy_1.addDays(startDate, offset)
            })), { concurrency: CONCURRENCY_LIMIT });
            const elapsedSeconds = (new Date().valueOf() - startTimestamp) / 1000;
            debug_1.debug('dataset download finished for %s %s %s from %s to %s, time: %s seconds', exchange, dataType, symbol, from, to, elapsedSeconds);
        }
    }
}
exports.downloadDatasets = downloadDatasets;
function getDownloadOptions({ apiKey, exchange, dataType, date, symbol, format, downloadDir, getFilename }) {
    const year = date.getUTCFullYear();
    const month = handy_1.doubleDigit(date.getUTCMonth() + 1);
    const day = handy_1.doubleDigit(date.getUTCDate());
    const url = `${options.datasetsEndpoint}/${exchange}/${dataType}/${year}/${month}/${day}/${symbol}.${format}.gz`;
    const filename = getFilename({
        dataType,
        date,
        exchange,
        format,
        symbol
    });
    const downloadPath = `${downloadDir}/${filename}`;
    return {
        url,
        downloadPath,
        userAgent: options._userAgent,
        apiKey
    };
}
function getFilenameDefault({ exchange, dataType, format, date, symbol }) {
    return `${exchange}_${dataType}_${date.toISOString().split('T')[0]}_${symbol}.${format}.gz`;
}
function getDownloadDateRange({ from, to }) {
    if (!from || isNaN(Date.parse(from))) {
        throw new Error(`Invalid "from" argument: ${from}. Please provide valid date string.`);
    }
    if (!to || isNaN(Date.parse(to))) {
        throw new Error(`Invalid "to" argument: ${to}. Please provide valid date string.`);
    }
    const toDate = handy_1.parseAsUTCDate(to);
    const fromDate = handy_1.parseAsUTCDate(from);
    const daysCountToFetch = Math.floor((toDate.getTime() - fromDate.getTime()) / MILLISECONDS_IN_SINGLE_DAY);
    if (daysCountToFetch < 1) {
        throw new Error(`Invalid "to" and "from" arguments combination. Please provide "to" day that is later than "from" day.`);
    }
    return {
        startDate: fromDate,
        daysCountToFetch
    };
}
//# sourceMappingURL=downloaddatasets.js.map