import { Exchange } from './types';
export declare function getApiKeyAccessInfo(apiKey?: string): Promise<ApiKeyAccessInfo>;
export declare type ApiKeyAccessInfo = {
    exchange: Exchange;
    from: string;
    to: string;
    symbols: string[];
}[];
//# sourceMappingURL=apikeyaccessinfo.d.ts.map