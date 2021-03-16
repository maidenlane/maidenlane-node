"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRealTimeFeedFactory = exports.createRealTimeFeed = exports.getRealTimeFeedFactory = void 0;
const binance_1 = require("./binance");
const binancedex_1 = require("./binancedex");
const bitfinex_1 = require("./bitfinex");
const bitflyer_1 = require("./bitflyer");
const bitmex_1 = require("./bitmex");
const bitstamp_1 = require("./bitstamp");
const bybit_1 = require("./bybit");
const coinbase_1 = require("./coinbase");
const cryptofacilities_1 = require("./cryptofacilities");
const deribit_1 = require("./deribit");
const ftx_1 = require("./ftx");
const gemini_1 = require("./gemini");
const hitbtc_1 = require("./hitbtc");
const huobi_1 = require("./huobi");
const kraken_1 = require("./kraken");
const okex_1 = require("./okex");
const phemex_1 = require("./phemex");
const delta_1 = require("./delta");
const gateio_1 = require("./gateio");
const gateiofutures_1 = require("./gateiofutures");
const poloniex_1 = require("./poloniex");
const coinflex_1 = require("./coinflex");
__exportStar(require("./realtimefeed"), exports);
const realTimeFeedsMap = {
    bitmex: bitmex_1.BitmexRealTimeFeed,
    binance: binance_1.BinanceRealTimeFeed,
    'binance-jersey': binance_1.BinanceJerseyRealTimeFeed,
    'binance-us': binance_1.BinanceUSRealTimeFeed,
    'binance-dex': binancedex_1.BinanceDexRealTimeFeed,
    'binance-futures': binance_1.BinanceFuturesRealTimeFeed,
    'binance-delivery': binance_1.BinanceDeliveryRealTimeFeed,
    bitfinex: bitfinex_1.BitfinexRealTimeFeed,
    'bitfinex-derivatives': bitfinex_1.BitfinexRealTimeFeed,
    bitflyer: bitflyer_1.BitflyerRealTimeFeed,
    bitstamp: bitstamp_1.BitstampRealTimeFeed,
    coinbase: coinbase_1.CoinbaseRealTimeFeed,
    cryptofacilities: cryptofacilities_1.CryptofacilitiesRealTimeFeed,
    deribit: deribit_1.DeribitRealTimeDataFeed,
    ftx: ftx_1.FtxRealTimeFeed,
    'ftx-us': ftx_1.FtxUSRealTimeFeed,
    gemini: gemini_1.GeminiRealTimeFeed,
    kraken: kraken_1.KrakenRealTimeFeed,
    okex: okex_1.OkexRealTimeFeed,
    'okex-futures': okex_1.OkexRealTimeFeed,
    'okex-swap': okex_1.OkexRealTimeFeed,
    'okex-options': okex_1.OkexOptionsRealTimeFeed,
    'huobi-dm': huobi_1.HuobiDMRealTimeFeed,
    'huobi-dm-swap': huobi_1.HuobiDMSwapRealTimeFeed,
    'huobi-dm-linear-swap': huobi_1.HuobiDMLinearSwapRealTimeFeed,
    huobi: huobi_1.HuobiRealTimeFeed,
    bybit: bybit_1.BybitRealTimeDataFeed,
    okcoin: okex_1.OKCoinRealTimeFeed,
    hitbtc: hitbtc_1.HitBtcRealTimeFeed,
    phemex: phemex_1.PhemexRealTimeFeed,
    delta: delta_1.DeltaRealTimeFeed,
    'gate-io': gateio_1.GateIORealTimeFeed,
    'gate-io-futures': gateiofutures_1.GateIOFuturesRealTimeFeed,
    poloniex: poloniex_1.PoloniexRealTimeFeed,
    coinflex: coinflex_1.CoinflexRealTimeFeed
};
function getRealTimeFeedFactory(exchange) {
    if (realTimeFeedsMap[exchange]) {
        return realTimeFeedsMap[exchange];
    }
    throw new Error(`not supported exchange ${exchange}`);
}
exports.getRealTimeFeedFactory = getRealTimeFeedFactory;
function createRealTimeFeed(exchange, filters, timeoutIntervalMS, onError) {
    const RealTimeFeedFactory = getRealTimeFeedFactory(exchange);
    return new RealTimeFeedFactory(exchange, filters, timeoutIntervalMS, onError);
}
exports.createRealTimeFeed = createRealTimeFeed;
function setRealTimeFeedFactory(exchange, realTimeFeed) {
    realTimeFeedsMap[exchange] = realTimeFeed;
}
exports.setRealTimeFeedFactory = setRealTimeFeedFactory;
//# sourceMappingURL=index.js.map