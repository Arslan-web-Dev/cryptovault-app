export interface PriceData {
    usd: number;
    change_24h: number;
    volume_24h?: number;
    market_cap?: number;
    last_updated: Date;
}
export interface CoinData {
    id: string;
    symbol: string;
    name: string;
    current_price: PriceData;
    sparkline_7d?: number[];
    price_change_percentage_1h?: number;
    price_change_percentage_24h?: number;
    price_change_percentage_7d?: number;
    market_cap_rank?: number;
}
export interface MarketOverview {
    total_market_cap: number;
    total_volume_24h: number;
    btc_dominance: number;
    eth_dominance: number;
    fear_greed_index: number;
    active_cryptocurrencies: number;
    market_cap_change_24h: number;
}
declare class MarketService {
    private readonly COINGECKO_BASE_URL;
    private readonly CACHE_TTL;
    private readonly SUPPORTED_COINS;
    getCurrentPrices(): Promise<{
        [key: string]: PriceData;
    }>;
    getCoinDetails(coinId: string): Promise<CoinData>;
    getHistoricalPrices(coinId: string, days?: number): Promise<{
        timestamp: number;
        price: number;
    }[]>;
    getMarketOverview(): Promise<MarketOverview>;
    getTopCoins(limit?: number, page?: number): Promise<CoinData[]>;
    searchCoins(query: string): Promise<CoinData[]>;
    getFearGreedIndex(): Promise<number>;
    getTrendingCoins(): Promise<CoinData[]>;
    private getSymbolFromId;
    private getFallbackPrices;
    private getFallbackMarketOverview;
    startPriceUpdates(callback: (prices: {
        [key: string]: PriceData;
    }) => void): Promise<void>;
    validateCoinId(coinId: string): boolean;
    getSupportedCoins(): string[];
}
declare const _default: MarketService;
export default _default;
//# sourceMappingURL=market.service.d.ts.map