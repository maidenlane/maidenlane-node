"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTradeBars = void 0;
const DATE_MIN = new Date(-1);
const computeTradeBars = (options) => () => new TradeBarComputable(options);
exports.computeTradeBars = computeTradeBars;
const kindSuffix = {
    tick: 'ticks',
    time: 'ms',
    volume: 'vol'
};
class TradeBarComputable {
    constructor({ kind, interval, name }) {
        // use book_change messages as workaround for issue when time passes for new bar to be produced but there's no trades,
        // so logic `compute` would not execute
        // assumption is that if one subscribes to book changes too then there's pretty good chance that
        // even if there are no trades, there's plenty of book changes that trigger computing new trade bar if time passess
        this.sourceDataTypes = ['trade', 'book_change'];
        this._type = 'trade_bar';
        this._kind = kind;
        this._interval = interval;
        if (name === undefined) {
            this._name = `${this._type}_${interval}${kindSuffix[kind]}`;
        }
        else {
            this._name = name;
        }
        this._inProgressBar = {};
        this._reset();
    }
    *compute(message) {
        // first check if there is a new trade bar for new timestamp for time based trade bars
        if (this._hasNewBar(message.timestamp)) {
            yield this._computeBar(message);
        }
        if (message.type !== 'trade') {
            return;
        }
        // update in progress trade bar with new data
        this._update(message);
        // and check again if there is a new trade bar after the update (volume/tick based trade bars)
        if (this._hasNewBar(message.timestamp)) {
            yield this._computeBar(message);
        }
    }
    _computeBar(message) {
        this._inProgressBar.localTimestamp = message.localTimestamp;
        this._inProgressBar.symbol = message.symbol;
        this._inProgressBar.exchange = message.exchange;
        const tradeBar = { ...this._inProgressBar };
        this._reset();
        return tradeBar;
    }
    _hasNewBar(timestamp) {
        // privided timestamp is an exchange trade timestamp in that case
        // we bucket based on exchange timestamps when bucketing by time not by localTimestamp
        if (this._inProgressBar.trades === 0) {
            return false;
        }
        if (this._kind === 'time') {
            const currentTimestampTimeBucket = this._getTimeBucket(timestamp);
            const openTimestampTimeBucket = this._getTimeBucket(this._inProgressBar.openTimestamp);
            if (currentTimestampTimeBucket > openTimestampTimeBucket) {
                // set the timestamp to the end of the period of given bucket
                this._inProgressBar.timestamp = new Date((openTimestampTimeBucket + 1) * this._interval);
                return true;
            }
            return false;
        }
        if (this._kind === 'volume') {
            return this._inProgressBar.volume >= this._interval;
        }
        if (this._kind === 'tick') {
            return this._inProgressBar.trades >= this._interval;
        }
        return false;
    }
    _update(trade) {
        const inProgressBar = this._inProgressBar;
        const isNotOpenedYet = inProgressBar.trades === 0;
        if (isNotOpenedYet) {
            inProgressBar.open = trade.price;
            inProgressBar.openTimestamp = trade.timestamp;
        }
        if (inProgressBar.high < trade.price) {
            inProgressBar.high = trade.price;
        }
        if (inProgressBar.low > trade.price) {
            inProgressBar.low = trade.price;
        }
        inProgressBar.close = trade.price;
        inProgressBar.closeTimestamp = trade.timestamp;
        inProgressBar.buyVolume += trade.side === 'buy' ? trade.amount : 0;
        inProgressBar.sellVolume += trade.side === 'sell' ? trade.amount : 0;
        inProgressBar.trades += 1;
        inProgressBar.vwap = (inProgressBar.vwap * inProgressBar.volume + trade.price * trade.amount) / (inProgressBar.volume + trade.amount);
        // volume needs to be updated after vwap otherwise vwap calc will go wrong
        inProgressBar.volume += trade.amount;
        inProgressBar.timestamp = trade.timestamp;
    }
    _reset() {
        const barToReset = this._inProgressBar;
        barToReset.type = this._type;
        barToReset.symbol = '';
        barToReset.exchange = '';
        barToReset.name = this._name;
        barToReset.interval = this._interval;
        barToReset.kind = this._kind;
        barToReset.open = 0;
        barToReset.high = Number.MIN_SAFE_INTEGER;
        barToReset.low = Number.MAX_SAFE_INTEGER;
        barToReset.close = 0;
        barToReset.volume = 0;
        barToReset.buyVolume = 0;
        barToReset.sellVolume = 0;
        barToReset.trades = 0;
        barToReset.vwap = 0;
        barToReset.openTimestamp = DATE_MIN;
        barToReset.closeTimestamp = DATE_MIN;
        barToReset.localTimestamp = DATE_MIN;
        barToReset.timestamp = DATE_MIN;
    }
    _getTimeBucket(timestamp) {
        return Math.floor(timestamp.valueOf() / this._interval);
    }
}
//# sourceMappingURL=tradebar.js.map