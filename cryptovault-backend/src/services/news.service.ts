import axios from 'axios';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  category: string;
  image_url?: string;
}

class NewsService {
  // Using a free public API for crypto news (CryptoPanic is great but requires key)
  // For demonstration, we'll use a curated list and provide a way to fetch real data
  private readonly NEWS_API_URL = 'https://cryptopanic.com/api/v1/posts/?auth_token=';

  async getLatestNews(category: string = 'all'): Promise<NewsItem[]> {
    try {
      // In a real app, you'd fetch from an API
      // const response = await axios.get(`${this.NEWS_API_URL}${process.env.NEWS_API_KEY}`);
      
      // Returning realistic data for now, but structured for API integration
      return this.getMockNews(category);
    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getMockNews(category);
    }
  }

  private getMockNews(category: string): NewsItem[] {
    const allNews: NewsItem[] = [
      {
        id: '1',
        title: 'Bitcoin Hits All-Time High Amid Institutional Adoption',
        description: 'Bitcoin has crossed the major resistance level as more institutions add BTC to their balance sheets.',
        url: 'https://example.com/news/1',
        source: 'CryptoDaily',
        published_at: new Date().toISOString(),
        category: 'Market',
        image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d'
      },
      {
        id: '2',
        title: 'Ethereum Shanghai Upgrade: What You Need to Know',
        description: 'The upcoming upgrade will allow validators to withdraw their staked ETH for the first time.',
        url: 'https://example.com/news/2',
        source: 'EtherWorld',
        published_at: new Date(Date.now() - 3600000).toISOString(),
        category: 'Technology',
        image_url: 'https://images.unsplash.com/photo-1622790698141-94e30457ef12'
      },
      {
        id: '3',
        title: 'Solana Network Sees 300% Growth in DeFi Activity',
        description: 'New protocols and lower fees are driving a massive influx of users to the Solana ecosystem.',
        url: 'https://example.com/news/3',
        source: 'SolanaInsider',
        published_at: new Date(Date.now() - 7200000).toISOString(),
        category: 'DeFi',
        image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0'
      },
      {
        id: '4',
        title: 'New Regulations for Crypto Exchanges in Europe',
        description: 'The MiCA framework is set to bring more clarity but also more compliance requirements for exchanges.',
        url: 'https://example.com/news/4',
        source: 'RegulationWatch',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        category: 'Policy',
        image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e'
      }
    ];

    if (category === 'all') return allNews;
    return allNews.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }
}

export default new NewsService();
