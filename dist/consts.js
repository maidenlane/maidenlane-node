"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCHANGE_CHANNELS_INFO = exports.EXCHANGES = void 0;
exports.EXCHANGES = [
    'bitmex',
    'deribit',
    'binance-futures',
    'binance-delivery',
    'binance',
    'ftx',
    'okex-futures',
    'okex-options',
    'okex-swap',
    'okex',
    'huobi-dm',
    'huobi-dm-swap',
    'huobi-dm-linear-swap',
    'huobi',
    'bitfinex-derivatives',
    'bitfinex',
    'coinbase',
    'cryptofacilities',
    'kraken',
    'bitstamp',
    'gemini',
    'poloniex',
    'bybit',
    'phemex',
    'delta',
    'ftx-us',
    'binance-us',
    'gate-io-futures',
    'gate-io',
    'okcoin',
    'bitflyer',
    'hitbtc',
    'coinflex',
    'binance-jersey',
    'binance-dex'
];
const BINANCE_CHANNELS = ['trade', 'aggTrade', 'ticker', 'depth', 'depthSnapshot', 'bookTicker', 'recentTrades', 'borrowInterest'];
const BINANCE_DEX_CHANNELS = ['trades', 'marketDiff', 'depthSnapshot'];
const BITFINEX_CHANNELS = ['trades', 'book', 'raw_book'];
const BITMEX_CHANNELS = [
    'trade',
    'orderBookL2',
    'liquidation',
    'connected',
    'announcement',
    'chat',
    'publicNotifications',
    'instrument',
    'settlement',
    'funding',
    'insurance',
    'orderBookL2_25',
    'orderBook10',
    'quote',
    'quoteBin1m',
    'quoteBin5m',
    'quoteBin1h',
    'quoteBin1d',
    'tradeBin1m',
    'tradeBin5m',
    'tradeBin1h',
    'tradeBin1d'
];
const BITSTAMP_CHANNELS = ['live_trades', 'live_orders', 'diff_order_book'];
const COINBASE_CHANNELS = [
    'match',
    'subscriptions',
    'received',
    'open',
    'done',
    'change',
    'l2update',
    'ticker',
    'snapshot',
    'last_match',
    'full_snapshot'
];
const DERIBIT_CHANNELS = [
    'book',
    'deribit_price_index',
    'deribit_price_ranking',
    'estimated_expiration_price',
    'markprice.options',
    'perpetual',
    'trades',
    'ticker',
    'quote',
    'platform_state'
];
const KRAKEN_CHANNELS = ['trade', 'ticker', 'book', 'spread'];
const OKEX_CHANNELS = ['spot/trade', 'spot/depth', 'spot/depth_l2_tbt', 'spot/ticker', 'system/status', 'margin/interest_rate'];
const OKCOIN_CHANNELS = ['spot/trade', 'spot/depth', 'spot/depth_l2_tbt', 'spot/ticker', 'system/status'];
const OKEX_FUTURES_CHANNELS = [
    'futures/trade',
    'futures/depth',
    'futures/depth_l2_tbt',
    'futures/ticker',
    'futures/mark_price',
    'futures/liquidation',
    'index/ticker',
    'system/status',
    'information/sentiment',
    'information/long_short_ratio',
    'information/margin'
];
const OKEX_SWAP_CHANNELS = [
    'swap/trade',
    'swap/depth',
    'swap/depth_l2_tbt',
    'swap/ticker',
    'swap/funding_rate',
    'swap/mark_price',
    'swap/liquidation',
    'index/ticker',
    'system/status',
    'information/sentiment',
    'information/long_short_ratio',
    'information/margin'
];
const OKEX_OPTIONS_CHANNELS = [
    'option/trade',
    'option/depth',
    'option/depth_l2_tbt',
    'option/ticker',
    'option/summary',
    'option/instruments',
    'index/ticker',
    'system/status',
    'option/trades'
];
const COINFLEX_CHANNELS = ['futures/depth', 'trade', 'ticker'];
const CRYPTOFACILITIES_CHANNELS = ['trade', 'trade_snapshot', 'book', 'book_snapshot', 'ticker', 'heartbeat'];
const FTX_CHANNELS = ['orderbook', 'trades', 'instrument', 'markets', 'orderbookGrouped', 'lendingRate', 'borrowRate'];
const GEMINI_CHANNELS = ['trade', 'l2_updates', 'auction_open', 'auction_indicative', 'auction_result'];
const BITFLYER_CHANNELS = ['lightning_executions', 'lightning_board_snapshot', 'lightning_board', 'lightning_ticker'];
const BINANCE_FUTURES_CHANNELS = [
    'trade',
    'aggTrade',
    'ticker',
    'depth',
    'markPrice',
    'depthSnapshot',
    'bookTicker',
    'forceOrder',
    'openInterest',
    'recentTrades',
    'compositeIndex',
    'topLongShortAccountRatio',
    'topLongShortPositionRatio',
    'globalLongShortAccountRatio'
];
const BINANCE_DELIVERY_CHANNELS = [
    'trade',
    'aggTrade',
    'ticker',
    'depth',
    'markPrice',
    'indexPrice',
    'depthSnapshot',
    'bookTicker',
    'forceOrder',
    'openInterest',
    'recentTrades',
    'topLongShortAccountRatio',
    'topLongShortPositionRatio',
    'globalLongShortAccountRatio'
];
const BITFINEX_DERIV_CHANNELS = ['trades', 'book', 'raw_book', 'status', 'liquidations'];
const HUOBI_CHANNELS = ['depth', 'detail', 'trade', 'bbo', 'mbp', 'etp'];
const HUOBI_DM_CHANNELS = [
    'depth',
    'detail',
    'trade',
    'bbo',
    'basis',
    'liquidation_orders',
    'contract_info',
    'open_interest',
    'elite_account_ratio',
    'elite_position_ratio'
];
const HUOBI_DM_SWAP_CHANNELS = [
    'depth',
    'detail',
    'trade',
    'bbo',
    'basis',
    'funding_rate',
    'liquidation_orders',
    'contract_info',
    'open_interest',
    'elite_account_ratio',
    'elite_position_ratio'
];
const HUOBI_DM_LINEAR_SWAP_CHANNELS = [
    'depth',
    'detail',
    'trade',
    'bbo',
    'basis',
    'funding_rate',
    'liquidation_orders',
    'contract_info',
    'open_interest',
    'elite_account_ratio',
    'elite_position_ratio'
];
const PHEMEX_CHANNELS = ['book', 'trades', 'market24h', 'spot_market24h'];
const BYBIT_CHANNELS = ['trade', 'instrument_info', 'orderBookL2_25', 'insurance', 'orderBook_200', 'liquidation'];
const HITBTC_CHANNELS = ['updateTrades', 'snapshotTrades', 'snapshotOrderbook', 'updateOrderbook'];
const FTX_US_CHANNELS = ['orderbook', 'trades', 'markets', 'orderbookGrouped'];
const DELTA_CHANNELS = [
    'l2_orderbook',
    'recent_trade',
    'recent_trade_snapshot',
    'mark_price',
    'spot_price',
    'funding_rate',
    'product_updates',
    'announcements',
    'all_trades',
    'v2/ticker'
];
const GATE_IO_CHANNELS = ['trades', 'depth', 'ticker'];
const GATE_IO_FUTURES_CHANNELS = ['trades', 'order_book', 'tickers'];
const POLONIEX_CHANNELS = ['price_aggregated_book'];
exports.EXCHANGE_CHANNELS_INFO = {
    bitmex: BITMEX_CHANNELS,
    coinbase: COINBASE_CHANNELS,
    deribit: DERIBIT_CHANNELS,
    cryptofacilities: CRYPTOFACILITIES_CHANNELS,
    bitstamp: BITSTAMP_CHANNELS,
    kraken: KRAKEN_CHANNELS,
    okex: OKEX_CHANNELS,
    'okex-swap': OKEX_SWAP_CHANNELS,
    'okex-futures': OKEX_FUTURES_CHANNELS,
    'okex-options': OKEX_OPTIONS_CHANNELS,
    binance: BINANCE_CHANNELS,
    'binance-jersey': BINANCE_CHANNELS,
    'binance-dex': BINANCE_DEX_CHANNELS,
    'binance-us': BINANCE_CHANNELS,
    bitfinex: BITFINEX_CHANNELS,
    ftx: FTX_CHANNELS,
    'ftx-us': FTX_US_CHANNELS,
    gemini: GEMINI_CHANNELS,
    bitflyer: BITFLYER_CHANNELS,
    'binance-futures': BINANCE_FUTURES_CHANNELS,
    'binance-delivery': BINANCE_DELIVERY_CHANNELS,
    'bitfinex-derivatives': BITFINEX_DERIV_CHANNELS,
    huobi: HUOBI_CHANNELS,
    'huobi-dm': HUOBI_DM_CHANNELS,
    'huobi-dm-swap': HUOBI_DM_SWAP_CHANNELS,
    'huobi-dm-linear-swap': HUOBI_DM_LINEAR_SWAP_CHANNELS,
    bybit: BYBIT_CHANNELS,
    okcoin: OKCOIN_CHANNELS,
    hitbtc: HITBTC_CHANNELS,
    coinflex: COINFLEX_CHANNELS,
    phemex: PHEMEX_CHANNELS,
    delta: DELTA_CHANNELS,
    'gate-io': GATE_IO_CHANNELS,
    'gate-io-futures': GATE_IO_FUTURES_CHANNELS,
    poloniex: POLONIEX_CHANNELS
};
//# sourceMappingURL=consts.js.map