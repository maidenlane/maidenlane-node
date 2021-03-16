"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compute = void 0;
async function* _compute(messages, ...computables) {
    const factory = new Computables(computables);
    for await (const message of messages) {
        // always pass through source message
        yield message;
        if (message.type === 'disconnect') {
            // reset all computables for given exchange if we've received disconnect for it
            factory.reset(message.exchange);
            continue;
        }
        const normalizedMessage = message;
        const id = normalizedMessage.name !== undefined ? `${normalizedMessage.symbol}:${normalizedMessage.name}` : normalizedMessage.symbol;
        const computablesMap = factory.getOrCreate(normalizedMessage.exchange, id);
        const computables = computablesMap[normalizedMessage.type];
        if (!computables)
            continue;
        for (const computable of computables) {
            for (const computedMessage of computable.compute(normalizedMessage)) {
                yield computedMessage;
            }
        }
    }
}
function compute(messages, ...computables) {
    let _iterator = _compute(messages, ...computables);
    if (messages.__realtime__ === true) {
        ;
        _iterator.__realtime__ = true;
    }
    return _iterator;
}
exports.compute = compute;
class Computables {
    constructor(_computablesFactories) {
        this._computablesFactories = _computablesFactories;
        this._computables = {};
    }
    getOrCreate(exchange, id) {
        if (this._computables[exchange] === undefined) {
            this._computables[exchange] = {};
        }
        if (this._computables[exchange][id] === undefined) {
            this._computables[exchange][id] = createComputablesMap(this._computablesFactories.map((c) => c()));
        }
        return this._computables[exchange][id];
    }
    reset(exchange) {
        this._computables[exchange] = undefined;
    }
}
function createComputablesMap(computables) {
    return computables.reduce((acc, computable) => {
        computable.sourceDataTypes.forEach((dataType) => {
            const existing = acc[dataType];
            if (!existing) {
                acc[dataType] = [computable];
            }
            else {
                acc[dataType].push(computable);
            }
        });
        return acc;
    }, {});
}
//# sourceMappingURL=computable.js.map