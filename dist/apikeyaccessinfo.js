"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeyAccessInfo = void 0;
const got_1 = __importDefault(require("got"));
const options_1 = require("./options");
async function getApiKeyAccessInfo(apiKey) {
    const options = options_1.getOptions();
    const apiKeyToCheck = apiKey || options.apiKey;
    const apiKeyAccessInfo = await got_1.default
        .get(`${options.endpoint}/api-key-info`, {
        headers: {
            Authorization: `Bearer ${apiKeyToCheck}`
        }
    })
        .json();
    return apiKeyAccessInfo;
}
exports.getApiKeyAccessInfo = getApiKeyAccessInfo;
//# sourceMappingURL=apikeyaccessinfo.js.map