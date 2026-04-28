"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
const error_middleware_1 = require("../middleware/error.middleware");
class MarketService {
    constructor() {
        this.COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
        this.CACHE_TTL = 300; // 5 minutes
        this.SUPPORTED_COINS = ['bitcoin', 'ethereum', 'solana', 'tether'];
    }
    async getCurrentPrices() {
        try {
            // Try to get from cache first
            const cachedPrices = await redis_1.default.getMarketPrices();
            if (cachedPrices) {
                return cachedPrices;
            }
            // Fetch from CoinGecko
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/simple/price`, {
                params: {
                    ids: this.SUPPORTED_COINS.join(','),
                    vs_currencies: 'usd',
                    include_24hr_change: true,
                    include_24hr_vol: true,
                    include_market_cap: true
                },
                timeout: 10000
            });
            const prices = {};
            for (const coinId of this.SUPPORTED_COINS) {
                const data = response.data[coinId];
                if (data) {
                    const symbol = this.getSymbolFromId(coinId);
                    prices[symbol] = {
                        usd: data.usd,
                        change_24h: data.usd_24h_change || 0,
                        volume_24h: data.usd_24h_vol || 0,
                        market_cap: data.usd_market_cap || 0,
                        last_updated: new Date()
                    };
                }
            }
            // Cache the results
            await redis_1.default.cacheMarketPrices(prices, this.CACHE_TTL);
            return prices;
        }
        catch (error) {
            console.error('Failed to fetch prices from CoinGecko:', error);
            // Return fallback prices
            return this.getFallbackPrices();
        }
    }
    async getCoinDetails(coinId) {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/coins/${coinId}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                    sparkline: true
                },
                timeout: 10000
            });
            const data = response.data;
            return {
                id: data.id,
                symbol: data.symbol.toUpperCase(),
                name: data.name,
                current_price: {
                    usd: data.market_data.current_price.usd,
                    change_24h: data.market_data.price_change_percentage_24h || 0,
                    volume_24h: data.market_data.total_volume.usd || 0,
                    market_cap: data.market_data.market_cap.usd || 0,
                    last_updated: new Date(data.market_data.last_updated)
                },
                sparkline_7d: data.market_data.sparkline_7d.price,
                price_change_percentage_1h: data.market_data.price_change_percentage_1h_in_currency?.usd,
                price_change_percentage_24h: data.market_data.price_change_percentage_24h,
                price_change_percentage_7d: data.market_data.price_change_percentage_7d,
                market_cap_rank: data.market_cap_rank
            };
        }
        catch (error) {
            console.error(`Failed to fetch coin details for ${coinId}:`, error);
            throw (0, error_middleware_1.createError)('Failed to fetch coin details', 500);
        }
    }
    async getHistoricalPrices(coinId, days = 7) {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days: days,
                    interval: days <= 1 ? 'hourly' : 'daily'
                },
                timeout: 15000
            });
            return response.data.prices.map(([timestamp, price]) => ({
                timestamp,
                price
            }));
        }
        catch (error) {
            console.error(`Failed to fetch historical prices for ${coinId}:`, error);
            throw (0, error_middleware_1.createError)('Failed to fetch historical prices', 500);
        }
    }
    async getMarketOverview() {
        try {
            // Try to get from cache first
            const cacheKey = 'market:overview';
            const cached = await redis_1.default.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/global`, { timeout: 10000 });
            const data = response.data.data;
            const overview = {
                total_market_cap: data.total_market_cap.usd || 0,
                total_volume_24h: data.total_volume.usd || 0,
                btc_dominance: data.market_cap_percentage.btc || 0,
                eth_dominance: data.market_cap_percentage.eth || 0,
                fear_greed_index: await this.getFearGreedIndex(),
                active_cryptocurrencies: data.active_cryptocurrencies || 0,
                market_cap_change_24h: data.market_cap_change_percentage_24h_usd || 0
            };
            // Cache for 5 minutes
            await redis_1.default.setex(cacheKey, this.CACHE_TTL, JSON.stringify(overview));
            return overview;
        }
        catch (error) {
            console.error('Failed to fetch market overview:', error);
            // Return fallback data
            return this.getFallbackMarketOverview();
        }
    }
    async getTopCoins(limit = 100, page = 1) {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: limit,
                    page: page,
                    sparkline: true,
                    price_change_percentage: '1h,24h,7d'
                },
                timeout: 15000
            });
            return response.data.map((coin) => ({
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                current_price: {
                    usd: coin.current_price,
                    change_24h: coin.price_change_percentage_24h || 0,
                    volume_24h: coin.total_volume || 0,
                    market_cap: coin.market_cap || 0,
                    last_updated: new Date()
                },
                sparkline_7d: coin.sparkline_in_7d?.price,
                price_change_percentage_1h: coin.price_change_percentage_1h_in_currency,
                price_change_percentage_24h: coin.price_change_percentage_24h,
                price_change_percentage_7d: coin.price_change_percentage_7d,
                market_cap_rank: coin.market_cap_rank
            }));
        }
        catch (error) {
            console.error('Failed to fetch top coins:', error);
            throw (0, error_middleware_1.createError)('Failed to fetch top coins', 500);
        }
    }
    async searchCoins(query) {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/search`, {
                params: {
                    query: query
                },
                timeout: 10000
            });
            const coins = response.data.coins.slice(0, 10);
            return coins.map((coin) => ({
                id: coin.id,
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                current_price: {
                    usd: 0, // Search doesn't include price, would need separate call
                    change_24h: 0,
                    last_updated: new Date()
                },
                market_cap_rank: coin.market_cap_rank
            }));
        }
        catch (error) {
            console.error('Failed to search coins:', error);
            throw (0, error_middleware_1.createError)('Failed to search coins', 500);
        }
    }
    async getFearGreedIndex() {
        try {
            // Using Alternative.me API for Fear & Greed Index
            const response = await axios_1.default.get('https://api.alternative.me/fng/', { timeout: 10000 });
            return parseInt(response.data.data[0].value) || 50;
        }
        catch (error) {
            console.error('Failed to fetch Fear & Greed Index:', error);
            return 50; // Neutral as fallback
        }
    }
    async getTrendingCoins() {
        try {
            const response = await axios_1.default.get(`${this.COINGECKO_BASE_URL}/search/trending`, { timeout: 10000 });
            return response.data.coins.slice(0, 7).map((item) => ({
                id: item.item.id,
                symbol: item.item.symbol.toUpperCase(),
                name: item.item.name,
                current_price: {
                    usd: item.item.price_btc ? 0 : 0, // Trending API doesn't provide USD price directly
                    change_24h: item.item.market_cap_rank ? 0 : 0,
                    last_updated: new Date()
                },
                market_cap_rank: item.item.market_cap_rank
            }));
        }
        catch (error) {
            console.error('Failed to fetch trending coins:', error);
            return [];
        }
    }
    getSymbolFromId(coinId) {
        const mapping = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'solana': 'SOL',
            'tether': 'USDT'
        };
        return mapping[coinId] || coinId.toUpperCase();
    }
    getFallbackPrices() {
        return {
            'BTC': {
                usd: 42000,
                change_24h: 2.5,
                volume_24h: 25000000000,
                market_cap: 823500000000,
                last_updated: new Date()
            },
            'ETH': {
                usd: 2300,
                change_24h: -1.2,
                volume_24h: 15000000000,
                market_cap: 276200000000,
                last_updated: new Date()
            },
            'SOL': {
                usd: 95,
                change_24h: 5.1,
                volume_24h: 2500000000,
                market_cap: 41000000000,
                last_updated: new Date()
            },
            'USDT': {
                usd: 1.00,
                change_24h: 0.01,
                volume_24h: 45000000000,
                market_cap: 91000000000,
                last_updated: new Date()
            }
        };
    }
    getFallbackMarketOverview() {
        return {
            total_market_cap: 1700000000000,
            total_volume_24h: 85000000000,
            btc_dominance: 48.5,
            eth_dominance: 16.2,
            fear_greed_index: 55,
            active_cryptocurrencies: 23000,
            market_cap_change_24h: 1.2
        };
    }
    // WebSocket price updates
    async startPriceUpdates(callback) {
        setInterval(async () => {
            try {
                const prices = await this.getCurrentPrices();
                callback(prices);
            }
            catch (error) {
                console.error('Failed to update prices:', error);
            }
        }, 30000); // Update every 30 seconds
    }
    validateCoinId(coinId) {
        return this.SUPPORTED_COINS.includes(coinId.toLowerCase());
    }
    getSupportedCoins() {
        return [...this.SUPPORTED_COINS];
    }
}
exports.default = new MarketService();
//# sourceMappingURL=market.service.js.map