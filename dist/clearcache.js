"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCacheSync = exports.clearCache = void 0;
const fs_extra_1 = require("fs-extra");
const debug_1 = require("./debug");
const options_1 = require("./options");
const handy_1 = require("./handy");
async function clearCache(exchange, filters, year, month, day) {
    try {
        const dirToRemove = getDirToRemove(exchange, filters, year, month, day);
        debug_1.debug('clearing cache dir: %s', dirToRemove);
        await fs_extra_1.remove(dirToRemove);
        debug_1.debug('cleared cache dir: %s', dirToRemove);
    }
    catch (e) {
        debug_1.debug('clearing cache dir error: %o', e);
    }
}
exports.clearCache = clearCache;
function clearCacheSync(exchange, filters, year, month, day) {
    try {
        const dirToRemove = getDirToRemove(exchange, filters, year, month, day);
        debug_1.debug('clearing cache (sync) dir: %s', dirToRemove);
        fs_extra_1.removeSync(dirToRemove);
        debug_1.debug('cleared cache(sync) dir: %s', dirToRemove);
    }
    catch (e) {
        debug_1.debug('clearing cache (sync) dir error: %o', e);
    }
}
exports.clearCacheSync = clearCacheSync;
function getDirToRemove(exchange, filters, year, month, day) {
    const options = options_1.getOptions();
    let dirToRemove = `${options.cacheDir}/feeds`;
    if (exchange !== undefined) {
        dirToRemove += `/${exchange}`;
    }
    if (filters !== undefined) {
        dirToRemove += `/${handy_1.sha256(handy_1.optimizeFilters(filters))}`;
    }
    if (year !== undefined) {
        dirToRemove += `/${year}`;
    }
    if (month !== undefined) {
        dirToRemove += `/${handy_1.doubleDigit(month)}`;
    }
    if (day !== undefined) {
        dirToRemove += `/${handy_1.doubleDigit(day)}`;
    }
    return dirToRemove;
}
//# sourceMappingURL=clearcache.js.map