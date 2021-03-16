"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.init = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const pkg = require('../package.json');
const defaultOptions = {
    endpoint: 'https://api.maidenlane.xyz/v1',
    datasetsEndpoint: 'https://datasets.maidenlane.xyz/v1',
    cacheDir: path_1.default.join(os_1.default.tmpdir(), '.maidenlane-cache'),
    apiKey: '',
    _userAgent: `maidenlane-dev/${pkg.version} (+https://github.com/maidenlane-dev/maidenlane-node)`
};
let options = { ...defaultOptions };
function init(initOptions = {}) {
    options = { ...defaultOptions, ...initOptions };
}
exports.init = init;
function getOptions() {
    return options;
}
exports.getOptions = getOptions;
//# sourceMappingURL=options.js.map