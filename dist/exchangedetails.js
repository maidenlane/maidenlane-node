"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeDetails = void 0;
const got_1 = __importDefault(require("got"));
const options_1 = require("./options");
async function getExchangeDetails(exchange) {
    const options = options_1.getOptions();
    const exchangeDetails = await got_1.default.get(`${options.endpoint}/exchanges/${exchange}`).json();
    return exchangeDetails;
}
exports.getExchangeDetails = getExchangeDetails;
//# sourceMappingURL=exchangedetails.js.map