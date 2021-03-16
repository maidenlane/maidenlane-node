"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GateIORealTimeFeed = void 0;
const realtimefeed_1 = require("./realtimefeed");
class GateIORealTimeFeed extends realtimefeed_1.RealTimeFeedBase {
    constructor() {
        super(...arguments);
        this.wssURL = 'wss://ws.gate.io/v3/';
    }
    mapToSubscribeMessages(filters) {
        const id = 1;
        const payload = filters.map((filter) => {
            if (!filter.symbols || filter.symbols.length === 0) {
                throw new Error('GateIORealTimeFeed requires explicitly specified symbols when subscribing to live feed');
            }
            if (filter.channel === 'depth') {
                return {
                    id,
                    method: `${filter.channel}.subscribe`,
                    params: filter.symbols.map((s) => {
                        return [s, 30, '0'];
                    })
                };
            }
            else {
                return {
                    id,
                    method: `${filter.channel}.subscribe`,
                    params: filter.symbols
                };
            }
        });
        return payload;
    }
    messageIsError(message) {
        if (message.error !== null && message.error !== undefined) {
            return true;
        }
        return false;
    }
}
exports.GateIORealTimeFeed = GateIORealTimeFeed;
//# sourceMappingURL=gateio.js.map