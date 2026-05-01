import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Wallet, Plus, Copy, ArrowUpRight, ArrowDownRight, MoreVertical, Bell, Settings, LogOut, Search } from 'lucide-angular';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NavbarComponent],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <app-navbar></app-navbar>

      <main class="wallet-layout container">
        <header class="wallet-header">
          <div>
            <h1 class="wallet-title">My Wallets</h1>
            <p class="wallet-subtitle">Manage your digital assets and private keys</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary">
              <lucide-icon [name]="plus" size="18"></lucide-icon>
              <span>Add New Wallet</span>
            </button>
          </div>
        </header>

        <section class="wallets-grid">
          @for (wallet of wallets; track wallet.address) {
            <div class="wallet-card glass">
              <div class="wallet-card-header">
                <div class="coin-badge">
                  <div class="coin-icon-circle" [style.background]="wallet.color">
                    {{ wallet.symbol.charAt(0) }}
                  </div>
                  <div class="coin-info">
                    <span class="coin-name">{{ wallet.name }}</span>
                    <span class="coin-symbol">{{ wallet.symbol }}</span>
                  </div>
                </div>
                <button class="action-btn">
                  <lucide-icon [name]="moreVertical" size="18"></lucide-icon>
                </button>
              </div>

              <div class="wallet-balance">
                <div class="balance-amount">{{ wallet.balance }} {{ wallet.symbol }}</div>
                <div class="balance-fiat">≈ \${{ wallet.fiatValue.toLocaleString() }}</div>
              </div>

              <div class="wallet-address">
                <span>{{ wallet.address.substring(0, 10) }}...{{ wallet.address.substring(34) }}</span>
                <lucide-icon [name]="copy" size="14" class="copy-btn"></lucide-icon>
              </div>
            </div>
          }
        </section>

        <section class="assets-section">
          <div class="section-header">
            <h2 class="section-title">All Assets</h2>
            <div class="search-box glass">
              <lucide-icon [name]="search" size="18"></lucide-icon>
              <input type="text" placeholder="Search assets...">
            </div>
          </div>

          <div class="table-card glass">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Balance</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>24h Change</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (asset of assets; track asset.symbol) {
                  <tr>
                    <td>
                      <div class="asset-cell">
                        <div class="asset-icon-sm" [style.background]="asset.color">
                          {{ asset.symbol.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-bold">{{ asset.name }}</div>
                          <div class="text-secondary text-sm">{{ asset.symbol }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="font-medium">{{ asset.balance }}</td>
                    <td>\${{ asset.price.toLocaleString() }}</td>
                    <td class="font-bold">\${{ (asset.balance * asset.price).toLocaleString() }}</td>
                    <td>
                      <div class="portfolio-trend" [class.up]="asset.change >= 0" [class.down]="asset.change < 0">
                        <lucide-icon [name]="asset.change >= 0 ? arrowUpRight : arrowDownRight" size="14"></lucide-icon>
                        {{ asset.change }}%
                      </div>
                    </td>
                    <td>
                      <button class="btn btn-ghost p-2">
                        <lucide-icon [name]="moreVertical" size="18"></lucide-icon>
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
  styleUrls: ['./wallet.component.scss', '../dashboard/dashboard.component.scss']
})
export class WalletComponent {
  shield = Shield;
  plus = Plus;
  copy = Copy;
  moreVertical = MoreVertical;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  search = Search;

  wallets = [
    { name: 'Bitcoin', symbol: 'BTC', balance: '0.15', fiatValue: 6323.45, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', color: '#f7931a' },
    { name: 'Ethereum', symbol: 'ETH', balance: '2.5', fiatValue: 5586.40, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', color: '#627eea' },
    { name: 'Solana', symbol: 'SOL', balance: '10.0', fiatValue: 956.70, address: 'HN7cABqLuyE1HG1QBfFGsTyT3S1v7v5c3X2WkHqXqXqX', color: '#00d4aa' }
  ];

  assets = [
    { name: 'Bitcoin', symbol: 'BTC', balance: 0.15, price: 42156.32, change: 2.5, color: '#f7931a' },
    { name: 'Ethereum', symbol: 'ETH', balance: 2.5, price: 2234.56, change: -1.2, color: '#627eea' },
    { name: 'Solana', symbol: 'SOL', balance: 10, price: 95.67, change: 5.1, color: '#00d4aa' },
    { name: 'Tether', symbol: 'USDT', balance: 183.45, price: 1.0, change: 0.01, color: '#26a17b' },
    { name: 'Cardano', symbol: 'ADA', balance: 1500, price: 0.48, change: 1.5, color: '#0033ad' },
    { name: 'Ripple', symbol: 'XRP', balance: 500, price: 0.52, change: -2.1, color: '#23292f' }
  ];
}
