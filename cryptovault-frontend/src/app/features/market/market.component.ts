import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Bell, Settings, LogOut, ArrowUpRight, ArrowDownRight, Search, Star, Filter } from 'lucide-angular';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { MarketService, CoinData } from '../../core/services/market.service';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NavbarComponent],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <app-navbar></app-navbar>

      <main class="market-layout container">
        <header class="market-header">
          <h1 class="market-title">Market Overview</h1>
          <p class="text-secondary">Real-time prices and market insights for all assets</p>
        </header>

        <section class="featured-grid">
          @for (coin of featuredCoins; track coin.id) {
            <div class="featured-card glass">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <img [src]="coin.image" class="w-8 h-8 rounded-full" alt="coin icon">
                  <div>
                    <div class="font-bold">{{ coin.name }}</div>
                    <div class="text-secondary text-sm uppercase">{{ coin.symbol }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="portfolio-trend text-sm" [class.up]="coin.price_change_percentage_24h >= 0" [class.down]="coin.price_change_percentage_24h < 0">
                    {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{ coin.price_change_percentage_24h.toFixed(2) }}%
                  </div>
                </div>
              </div>
              <div class="text-2xl font-bold">\${{ coin.current_price.toLocaleString() }}</div>
              <div class="chart-mini" [class.down]="coin.price_change_percentage_24h < 0"></div>
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
            </div>
            <div class="flex gap-4">
              <div class="search-box glass">
                <lucide-icon [name]="search" size="18"></lucide-icon>
                <input type="text" placeholder="Search..." (input)="onSearch($event)">
              </div>
              <button class="btn btn-ghost p-3">
                <lucide-icon [name]="filter" size="18"></lucide-icon>
              </button>
            </div>
          </div>

          @if (isLoading) {
            <div class="flex justify-center py-20">
              <div class="spinner"></div>
            </div>
          } @else {
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
                  @for (coin of filteredCoins; track coin.id; let i = $index) {
                    <tr class="coin-row">
                      <td><span class="rank-badge">{{ coin.market_cap_rank }}</span></td>
                      <td>
                        <div class="asset-cell">
                          <img [src]="coin.image" class="w-8 h-8 rounded-full" alt="coin icon">
                          <div>
                            <div class="font-bold">{{ coin.name }}</div>
                            <div class="text-secondary text-sm uppercase">{{ coin.symbol }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="font-bold">\${{ coin.current_price.toLocaleString() }}</td>
                      <td>
                        <div class="portfolio-trend font-bold" [class.up]="coin.price_change_percentage_24h >= 0" [class.down]="coin.price_change_percentage_24h < 0">
                          {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{ coin.price_change_percentage_24h.toFixed(2) }}%
                        </div>
                      </td>
                      <td>\${{ formatVolume(coin.market_cap) }}</td>
                      <td>\${{ formatVolume(coin.total_volume) }}</td>
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
          }
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./market.component.scss', '../dashboard/dashboard.component.scss']
})
export class MarketComponent implements OnInit {
  shield = Shield;
  search = Search;
  star = Star;
  filter = Filter;

  marketCoins: CoinData[] = [];
  filteredCoins: CoinData[] = [];
  featuredCoins: CoinData[] = [];
  isLoading = true;

  constructor(private marketService: MarketService) {}

  ngOnInit() {
    this.fetchMarketData();
  }

  fetchMarketData() {
    this.isLoading = true;
    this.marketService.getTopCoins().subscribe({
      next: (data) => {
        this.marketCoins = data;
        this.filteredCoins = data;
        this.featuredCoins = data.slice(0, 3);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredCoins = this.marketCoins.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.symbol.toLowerCase().includes(query)
    );
  }

  formatVolume(val: number): string {
    if (val >= 1e12) return (val / 1e12).toFixed(1) + 'T';
    if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
    if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    return val.toLocaleString();
  }
}
