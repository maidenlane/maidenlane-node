"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstrumentInfo = void 0;
const got_1 = __importDefault(require("got"));
const options_1 = require("./options");
async function getInstrumentInfo(exchange, filterOrSymbol) {
    if (Array.isArray(exchange)) {
        const exchanges = exchange;
        const results = await Promise.all(exchanges.map((e) => getInstrumentInfoForExchange(e, filterOrSymbol)));
        return results.flat();
    }
    else {
        return getInstrumentInfoForExchange(exchange, filterOrSymbol);
    }
}
exports.getInstrumentInfo = getInstrumentInfo;
async function getInstrumentInfoForExchange(exchange, filterOrSymbol) {
    var _a;
    const options = options_1.getOptions();
    let url = `${options.endpoint}/instruments/${exchange}`;
    if (typeof filterOrSymbol === 'string') {
        url += `/${filterOrSymbol}`;
    }
    else if (typeof filterOrSymbol === 'object') {
        url += `?filter=${encodeURIComponent(JSON.stringify(filterOrSymbol))}`;
    }
    try {
        return await got_1.default
            .get(url, {
            headers: { Authorization: `Bearer ${options.apiKey}` }
        })
            .json();
    }
    catch (e) {
        // expose 400 error message from server
        if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.statusCode) === 400) {
            let err;
            try {
                err = JSON.parse(e.response.body);
            }
            catch {
                throw e;
            }
            throw err ? new Error(`${err.message} (${err.code})`) : e;
        }
        else {
            throw e;
        }
    }
}
//# sourceMappingURL=instrumentinfo.js.map