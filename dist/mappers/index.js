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
exports.normalizeLiquidations = exports.normalizeOptionsSummary = exports.normalizeDerivativeTickers = exports.normalizeBookChanges = exports.normalizeTrades = void 0;
const handy_1 = require("../handy");
const binance_1 = require("./binance");
const binancedex_1 = require("./binancedex");
const bitfinex_1 = require("./bitfinex");
const bitflyer_1 = require("./bitflyer");
const bitmex_1 = require("./bitmex");
const bitstamp_1 = require("./bitstamp");
const bybit_1 = require("./bybit");
const coinbase_1 = require("./coinbase");
const coinflex_1 = require("./coinflex");
const cryptofacilities_1 = require("./cryptofacilities");
const delta_1 = require("./delta");
const deribit_1 = require("./deribit");
const ftx_1 = require("./ftx");
const gateio_1 = require("./gateio");
const gateiofutures_1 = require("./gateiofutures");
const gemini_1 = require("./gemini");
const hitbtc_1 = require("./hitbtc");
const huobi_1 = require("./huobi");
const kraken_1 = require("./kraken");
const okex_1 = require("./okex");
const phemex_1 = require("./phemex");
const poloniex_1 = require("./poloniex");
__exportStar(require("./mapper"), exports);
const THREE_MINUTES_IN_MS = 3 * 60 * handy_1.ONE_SEC_IN_MS;
const isRealTime = (date) => {
    if (process.env.__NO_REAL_TIME__) {
        return false;
    }
    return date.valueOf() + THREE_MINUTES_IN_MS > new Date().valueOf();
};
const tradesMappers = {
    bitmex: () => bitmex_1.bitmexTradesMapper,
    binance: () => new binance_1.BinanceTradesMapper('binance'),
    'binance-us': () => new binance_1.BinanceTradesMapper('binance-us'),
    'binance-jersey': () => new binance_1.BinanceTradesMapper('binance-jersey'),
    'binance-futures': () => new binance_1.BinanceTradesMapper('binance-futures'),
    'binance-delivery': () => new binance_1.BinanceTradesMapper('binance-delivery'),
    'binance-dex': () => binancedex_1.binanceDexTradesMapper,
    bitfinex: () => new bitfinex_1.BitfinexTradesMapper('bitfinex'),
    'bitfinex-derivatives': () => new bitfinex_1.BitfinexTradesMapper('bitfinex-derivatives'),
    bitflyer: () => bitflyer_1.bitflyerTradesMapper,
    bitstamp: () => bitstamp_1.bitstampTradesMapper,
    coinbase: () => coinbase_1.coinbaseTradesMapper,
    cryptofacilities: () => cryptofacilities_1.cryptofacilitiesTradesMapper,
    deribit: () => deribit_1.deribitTradesMapper,
    ftx: () => new ftx_1.FTXTradesMapper('ftx'),
    'ftx-us': () => new ftx_1.FTXTradesMapper('ftx-us'),
    gemini: () => gemini_1.geminiTradesMapper,
    kraken: () => kraken_1.krakenTradesMapper,
    okex: () => new okex_1.OkexTradesMapper('okex', 'spot'),
    'okex-futures': () => new okex_1.OkexTradesMapper('okex-futures', 'futures'),
    'okex-swap': () => new okex_1.OkexTradesMapper('okex-swap', 'swap'),
    'okex-options': () => new okex_1.OkexTradesMapper('okex-options', 'option'),
    huobi: () => new huobi_1.HuobiTradesMapper('huobi'),
    'huobi-dm': () => new huobi_1.HuobiTradesMapper('huobi-dm'),
    'huobi-dm-swap': () => new huobi_1.HuobiTradesMapper('huobi-dm-swap'),
    'huobi-dm-linear-swap': () => new huobi_1.HuobiTradesMapper('huobi-dm-linear-swap'),
    bybit: () => new bybit_1.BybitTradesMapper('bybit'),
    okcoin: () => new okex_1.OkexTradesMapper('okcoin', 'spot'),
    hitbtc: () => hitbtc_1.hitBtcTradesMapper,
    phemex: () => phemex_1.phemexTradesMapper,
    delta: (localTimestamp) => new delta_1.DeltaTradesMapper(localTimestamp.valueOf() >= new Date('2020-10-14').valueOf()),
    'gate-io': () => new gateio_1.GateIOTradesMapper('gate-io'),
    'gate-io-futures': () => new gateiofutures_1.GateIOFuturesTradesMapper('gate-io-futures'),
    poloniex: () => new poloniex_1.PoloniexTradesMapper(),
    coinflex: () => coinflex_1.coinflexTradesMapper
};
const bookChangeMappers = {
    bitmex: () => new bitmex_1.BitmexBookChangeMapper(),
    binance: (localTimestamp) => new binance_1.BinanceBookChangeMapper('binance', isRealTime(localTimestamp) === false),
    'binance-us': (localTimestamp) => new binance_1.BinanceBookChangeMapper('binance-us', isRealTime(localTimestamp) === false),
    'binance-jersey': (localTimestamp) => new binance_1.BinanceBookChangeMapper('binance-jersey', isRealTime(localTimestamp) === false),
    'binance-futures': (localTimestamp) => new binance_1.BinanceFuturesBookChangeMapper('binance-futures', isRealTime(localTimestamp) === false),
    'binance-delivery': (localTimestamp) => new binance_1.BinanceFuturesBookChangeMapper('binance-delivery', isRealTime(localTimestamp) === false),
    'binance-dex': () => binancedex_1.binanceDexBookChangeMapper,
    bitfinex: () => new bitfinex_1.BitfinexBookChangeMapper('bitfinex'),
    'bitfinex-derivatives': () => new bitfinex_1.BitfinexBookChangeMapper('bitfinex-derivatives'),
    bitflyer: () => new bitflyer_1.BitflyerBookChangeMapper(),
    bitstamp: () => new bitstamp_1.BitstampBookChangeMapper(),
    coinbase: () => new coinbase_1.CoinbaseBookChangMapper(),
    cryptofacilities: () => cryptofacilities_1.cryptofacilitiesBookChangeMapper,
    deribit: () => deribit_1.deribitBookChangeMapper,
    ftx: () => new ftx_1.FTXBookChangeMapper('ftx'),
    'ftx-us': () => new ftx_1.FTXBookChangeMapper('ftx-us'),
    gemini: () => gemini_1.geminiBookChangeMapper,
    kraken: () => kraken_1.krakenBookChangeMapper,
    okex: (localTimestamp) => new okex_1.OkexBookChangeMapper('okex', 'spot', localTimestamp.valueOf() >= new Date('2020-04-10').valueOf()),
    'okex-futures': (localTimestamp) => new okex_1.OkexBookChangeMapper('okex-futures', 'futures', localTimestamp.valueOf() >= new Date('2019-12-05').valueOf()),
    'okex-swap': (localTimestamp) => new okex_1.OkexBookChangeMapper('okex-swap', 'swap', localTimestamp.valueOf() >= new Date('2020-02-08').valueOf()),
    'okex-options': (localTimestamp) => new okex_1.OkexBookChangeMapper('okex-options', 'option', localTimestamp.valueOf() >= new Date('2020-02-08').valueOf()),
    huobi: (localTimestamp) => localTimestamp.valueOf() >= new Date('2020-07-03').valueOf()
        ? new huobi_1.HuobiMBPBookChangeMapper('huobi')
        : new huobi_1.HuobiBookChangeMapper('huobi'),
    'huobi-dm': () => new huobi_1.HuobiBookChangeMapper('huobi-dm'),
    'huobi-dm-swap': () => new huobi_1.HuobiBookChangeMapper('huobi-dm-swap'),
    'huobi-dm-linear-swap': () => new huobi_1.HuobiBookChangeMapper('huobi-dm-linear-swap'),
    bybit: () => new bybit_1.BybitBookChangeMapper('bybit', false),
    okcoin: (localTimestamp) => new okex_1.OkexBookChangeMapper('okcoin', 'spot', localTimestamp.valueOf() >= new Date('2020-02-13').valueOf()),
    hitbtc: () => hitbtc_1.hitBtcBookChangeMapper,
    phemex: () => phemex_1.phemexBookChangeMapper,
    delta: () => delta_1.deltaBookChangeMapper,
    'gate-io': () => new gateio_1.GateIOBookChangeMapper('gate-io'),
    'gate-io-futures': () => new gateiofutures_1.GateIOFuturesBookChangeMapper('gate-io-futures'),
    poloniex: () => new poloniex_1.PoloniexBookChangeMapper(),
    coinflex: () => coinflex_1.coinflexBookChangeMapper
};
const derivativeTickersMappers = {
    bitmex: () => new bitmex_1.BitmexDerivativeTickerMapper(),
    'binance-futures': () => new binance_1.BinanceFuturesDerivativeTickerMapper('binance-futures'),
    'binance-delivery': () => new binance_1.BinanceFuturesDerivativeTickerMapper('binance-delivery'),
    'bitfinex-derivatives': () => new bitfinex_1.BitfinexDerivativeTickerMapper(),
    cryptofacilities: () => new cryptofacilities_1.CryptofacilitiesDerivativeTickerMapper(),
    deribit: () => new deribit_1.DeribitDerivativeTickerMapper(),
    'okex-futures': () => new okex_1.OkexDerivativeTickerMapper('okex-futures'),
    'okex-swap': () => new okex_1.OkexDerivativeTickerMapper('okex-swap'),
    bybit: () => new bybit_1.BybitDerivativeTickerMapper(),
    phemex: () => new phemex_1.PhemexDerivativeTickerMapper(),
    ftx: () => new ftx_1.FTXDerivativeTickerMapper('ftx'),
    delta: (localTimestamp) => new delta_1.DeltaDerivativeTickerMapper(localTimestamp.valueOf() >= new Date('2020-10-14').valueOf()),
    'huobi-dm': () => new huobi_1.HuobiDerivativeTickerMapper('huobi-dm'),
    'huobi-dm-swap': () => new huobi_1.HuobiDerivativeTickerMapper('huobi-dm-swap'),
    'huobi-dm-linear-swap': () => new huobi_1.HuobiDerivativeTickerMapper('huobi-dm-linear-swap'),
    'gate-io-futures': () => new gateiofutures_1.GateIOFuturesDerivativeTickerMapper(),
    coinflex: () => new coinflex_1.CoinflexDerivativeTickerMapper()
};
const optionsSummaryMappers = {
    deribit: () => new deribit_1.DeribitOptionSummaryMapper(),
    'okex-options': () => new okex_1.OkexOptionSummaryMapper()
};
const liquidationsMappers = {
    ftx: () => new ftx_1.FTXLiquidationsMapper(),
    bitmex: () => bitmex_1.bitmexLiquidationsMapper,
    deribit: () => deribit_1.deribitLiquidationsMapper,
    'binance-futures': () => new binance_1.BinanceLiquidationsMapper('binance-futures'),
    'binance-delivery': () => new binance_1.BinanceLiquidationsMapper('binance-delivery'),
    'bitfinex-derivatives': () => new bitfinex_1.BitfinexLiquidationsMapper('bitfinex-derivatives'),
    cryptofacilities: () => cryptofacilities_1.cryptofacilitiesLiquidationsMapper,
    'huobi-dm': () => new huobi_1.HuobiLiquidationsMapper('huobi-dm'),
    'huobi-dm-swap': () => new huobi_1.HuobiLiquidationsMapper('huobi-dm-swap'),
    'huobi-dm-linear-swap': () => new huobi_1.HuobiLiquidationsMapper('huobi-dm-linear-swap'),
    bybit: () => new bybit_1.BybitLiquidationsMapper('bybit'),
    'okex-futures': () => new okex_1.OkexLiquidationsMapper('okex-futures', 'futures'),
    'okex-swap': () => new okex_1.OkexLiquidationsMapper('okex-swap', 'swap')
};
const normalizeTrades = (exchange, localTimestamp) => {
    const createTradesMapper = tradesMappers[exchange];
    if (createTradesMapper === undefined) {
        throw new Error(`normalizeTrades: ${exchange} not supported`);
    }
    return createTradesMapper(localTimestamp);
};
exports.normalizeTrades = normalizeTrades;
const normalizeBookChanges = (exchange, localTimestamp) => {
    const createBookChangesMapper = bookChangeMappers[exchange];
    if (createBookChangesMapper === undefined) {
        throw new Error(`normalizeBookChanges: ${exchange} not supported`);
    }
    return createBookChangesMapper(localTimestamp);
};
exports.normalizeBookChanges = normalizeBookChanges;
const normalizeDerivativeTickers = (exchange, localTimestamp) => {
    const createDerivativeTickerMapper = derivativeTickersMappers[exchange];
    if (createDerivativeTickerMapper === undefined) {
        throw new Error(`normalizeDerivativeTickers: ${exchange} not supported`);
    }
    return createDerivativeTickerMapper(localTimestamp);
};
exports.normalizeDerivativeTickers = normalizeDerivativeTickers;
const normalizeOptionsSummary = (exchange, _localTimestamp) => {
    const createOptionSummaryMapper = optionsSummaryMappers[exchange];
    if (createOptionSummaryMapper === undefined) {
        throw new Error(`normalizeOptionsSummary: ${exchange} not supported`);
    }
    return createOptionSummaryMapper();
};
exports.normalizeOptionsSummary = normalizeOptionsSummary;
const normalizeLiquidations = (exchange, _localTimestamp) => {
    const createLiquidationsMapper = liquidationsMappers[exchange];
    if (createLiquidationsMapper === undefined) {
        throw new Error(`normalizeLiquidations: ${exchange} not supported`);
    }
    return createLiquidationsMapper();
};
exports.normalizeLiquidations = normalizeLiquidations;
//# sourceMappingURL=index.js.map