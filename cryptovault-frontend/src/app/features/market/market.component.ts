import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Bell, Settings, LogOut, ArrowUpRight, ArrowDownRight, Search, Star, Filter } from 'lucide-angular';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <nav class="dashboard-nav glass">
        <div class="container nav-container">
          <div class="nav-brand">
            <div class="brand-icon">
              <lucide-icon [name]="shield"></lucide-icon>
            </div>
            <span>CryptoVault Pro</span>
          </div>
          
          <div class="nav-menu">
            <a routerLink="/dashboard" class="menu-item">Dashboard</a>
            <a routerLink="/wallet" class="menu-item">Wallet</a>
            <a routerLink="/market" class="menu-item active">Market</a>
            <a routerLink="/portfolio" class="menu-item">Portfolio</a>
          </div>
          
          <div class="nav-actions">
            <button class="action-btn">
              <lucide-icon [name]="bell" size="20"></lucide-icon>
            </button>
            <button class="action-btn">
              <lucide-icon [name]="settings" size="20"></lucide-icon>
            </button>
            <button class="action-btn">
              <lucide-icon [name]="logOut" size="20"></lucide-icon>
            </button>
          </div>
        </div>
      </nav>

      <main class="market-layout container">
        <header class="market-header">
          <h1 class="market-title">Market Overview</h1>
          <p class="text-secondary">Real-time prices and market insights for all assets</p>
        </header>

        <section class="featured-grid">
          @for (coin of featuredCoins; track coin.symbol) {
            <div class="featured-card glass">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="asset-icon-sm" [style.background]="coin.color">
                    {{ coin.symbol.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold">{{ coin.name }}</div>
                    <div class="text-secondary text-sm">{{ coin.symbol }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="portfolio-trend text-sm" [class.up]="coin.change >= 0" [class.down]="coin.change < 0">
                    {{ coin.change >= 0 ? '+' : '' }}{{ coin.change }}%
                  </div>
                </div>
              </div>
              <div class="text-2xl font-bold">\${{ coin.price.toLocaleString() }}</div>
              <div class="chart-mini" [class.down]="coin.change < 0"></div>
            </div>
          }
        </section>

        <section class="market-list">
          <div class="section-header flex flex-wrap justify-between items-center gap-4 mb-8">
            <div class="market-filters">
              <span class="filter-chip active">All Assets</span>
              <span class="filter-chip">Gainers</span>
              <span class="filter-chip">Losers</span>
              <span class="filter-chip">New</span>
              <span class="filter-chip">DeFi</span>
              <span class="filter-chip">Gaming</span>
            </div>
            <div class="flex gap-4">
              <div class="search-box glass">
                <lucide-icon [name]="search" size="18"></lucide-icon>
                <input type="text" placeholder="Search...">
              </div>
              <button class="btn btn-ghost p-3">
                <lucide-icon [name]="filter" size="18"></lucide-icon>
              </button>
            </div>
          </div>

          <div class="table-card glass">
            <table class="premium-table">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Market Cap</th>
                  <th>Volume (24h)</th>
                  <th style="width: 50px;"></th>
                </tr>
              </thead>
              <tbody>
                @for (coin of marketCoins; track coin.symbol; let i = $index) {
                  <tr class="coin-row">
                    <td><span class="rank-badge">{{ i + 1 }}</span></td>
                    <td>
                      <div class="asset-cell">
                        <div class="asset-icon-sm" [style.background]="coin.color">
                          {{ coin.symbol.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-bold">{{ coin.name }}</div>
                          <div class="text-secondary text-sm">{{ coin.symbol }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="font-bold">\${{ coin.price.toLocaleString() }}</td>
                    <td>
                      <div class="portfolio-trend font-bold" [class.up]="coin.change >= 0" [class.down]="coin.change < 0">
                        {{ coin.change >= 0 ? '+' : '' }}{{ coin.change }}%
                      </div>
                    </td>
                    <td>\${{ coin.marketCap }}</td>
                    <td>\${{ coin.volume }}</td>
                    <td>
                      <button class="text-secondary hover:text-warning transition">
                        <lucide-icon [name]="star" size="18"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./market.component.scss', '../dashboard/dashboard.component.scss']
})
export class MarketComponent {
  shield = Shield;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  trendingUp = TrendingUp;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
  search = Search;
  star = Star;
  filter = Filter;

  featuredCoins = [
    { name: 'Bitcoin', symbol: 'BTC', price: 42156.32, change: 2.5, color: '#f7931a' },
    { name: 'Ethereum', symbol: 'ETH', price: 2234.56, change: -1.2, color: '#627eea' },
    { name: 'Solana', symbol: 'SOL', price: 95.67, change: 5.1, color: '#00d4aa' }
  ];

  marketCoins = [
    { name: 'Bitcoin', symbol: 'BTC', price: 42156.32, change: 2.5, marketCap: '824.5B', volume: '35.2B', color: '#f7931a' },
    { name: 'Ethereum', symbol: 'ETH', price: 2234.56, change: -1.2, marketCap: '268.2B', volume: '18.4B', color: '#627eea' },
    { name: 'Tether', symbol: 'USDT', price: 1.0, change: 0.01, marketCap: '95.1B', volume: '45.7B', color: '#26a17b' },
    { name: 'Solana', symbol: 'SOL', price: 95.67, change: 5.1, marketCap: '42.3B', volume: '4.1B', color: '#00d4aa' },
    { name: 'BNB', symbol: 'BNB', price: 312.45, change: 0.8, marketCap: '48.2B', volume: '1.2B', color: '#f3ba2f' },
    { name: 'XRP', symbol: 'XRP', price: 0.52, change: -2.1, marketCap: '28.1B', volume: '2.5B', color: '#23292f' },
    { name: 'Cardano', symbol: 'ADA', price: 0.48, change: 1.5, marketCap: '16.8B', volume: '0.8B', color: '#0033ad' },
    { name: 'Avalanche', symbol: 'AVAX', price: 34.12, change: 8.4, marketCap: '12.5B', volume: '1.1B', color: '#e84142' }
  ];
}
