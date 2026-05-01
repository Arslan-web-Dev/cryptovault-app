import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, ArrowUpRight, ArrowDownRight, Activity, Search, Filter, Calendar, Bell, Settings, LogOut, FileText } from 'lucide-angular';

@Component({
  selector: 'app-transactions',
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
            <a routerLink="/wallet" class="menu-item active">Wallet</a>
            <a routerLink="/market" class="menu-item">Market</a>
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

      <main class="transaction-layout container">
        <header class="tx-header">
          <h1 class="wallet-title">Transaction History</h1>
          <p class="wallet-subtitle">A complete log of your blockchain activities</p>
        </header>

        <section class="tx-filters">
          <div class="search-box glass">
            <lucide-icon [name]="search" size="18"></lucide-icon>
            <input type="text" placeholder="Search by tx hash or address...">
          </div>
          <button class="btn btn-ghost glass">
            <lucide-icon [name]="filter" size="18"></lucide-icon>
            <span>Filters</span>
          </button>
          <button class="btn btn-ghost glass">
            <lucide-icon [name]="calendar" size="18"></lucide-icon>
            <span>Date Range</span>
          </button>
          <button class="btn btn-ghost glass">
            <lucide-icon [name]="fileText" size="18"></lucide-icon>
            <span>Export CSV</span>
          </button>
        </section>

        <div class="tx-card-list">
          @for (tx of transactions; track tx.hash) {
            <div class="tx-item glass">
              <div class="tx-icon-box" 
                   [class.bg-success/10]="tx.type === 'receive'"
                   [class.bg-error/10]="tx.type === 'send'"
                   [class.bg-accent-blue/10]="tx.type === 'swap'"
                   [class.text-success]="tx.type === 'receive'"
                   [class.text-error]="tx.type === 'send'"
                   [class.text-accent-blue]="tx.type === 'swap'">
                <lucide-icon 
                  [name]="tx.type === 'receive' ? arrowDownRight : tx.type === 'send' ? arrowUpRight : activity"
                  size="24">
                </lucide-icon>
              </div>

              <div class="tx-details">
                <span class="tx-type capitalize">{{ tx.type }} {{ tx.coin }}</span>
                <div class="tx-meta">
                  <span>{{ tx.date }}</span>
                  <span>•</span>
                  <span class="font-mono">{{ tx.hash.substring(0, 10) }}...{{ tx.hash.substring(54) }}</span>
                </div>
              </div>

              <div class="tx-status-cell">
                <span class="tx-status-badge" [class]="tx.status.toLowerCase()">
                  {{ tx.status }}
                </span>
              </div>

              <div class="tx-amount-cell text-right">
                <div class="font-bold text-lg" 
                     [class.text-success]="tx.type === 'receive'"
                     [class.text-error]="tx.type === 'send'">
                  {{ tx.type === 'receive' ? '+' : '-' }} {{ tx.amount }} {{ tx.coin }}
                </div>
                <div class="text-secondary text-sm">
                  ≈ \${{ tx.fiatAmount.toLocaleString() }}
                </div>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./transactions.component.scss', '../../../dashboard/dashboard.component.scss']
})
export class TransactionsComponent {
  shield = Shield;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
  activity = Activity;
  search = Search;
  filter = Filter;
  calendar = Calendar;
  fileText = FileText;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;

  transactions = [
    { type: 'receive', coin: 'BTC', amount: '0.025', fiatAmount: 1054.20, date: 'May 01, 2026 • 10:24 AM', status: 'Completed', hash: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlhf938fjs0293js' },
    { type: 'send', coin: 'ETH', amount: '1.2', fiatAmount: 2681.47, date: 'Apr 30, 2026 • 03:12 PM', status: 'Completed', hash: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F8274f8274f8274f' },
    { type: 'swap', coin: 'SOL', amount: '15.0', fiatAmount: 1435.05, date: 'Apr 29, 2026 • 11:45 AM', status: 'Completed', hash: 'HN7cABqLuyE1HG1QBfFGsTyT3S1v7v5c3X2WkHqXqXqX8274f8274f8274f' },
    { type: 'receive', coin: 'USDT', amount: '500.0', fiatAmount: 500.00, date: 'Apr 28, 2026 • 09:00 AM', status: 'Pending', hash: '0x8274f8274f8274f8274f8274f8274f8274f8274f8274f8274f8274f' },
    { type: 'send', coin: 'BTC', amount: '0.005', fiatAmount: 210.84, date: 'Apr 27, 2026 • 06:30 PM', status: 'Failed', hash: 'bc1q9283js0293js0293js0293js0293js0293js0293js0293js0293js' }
  ];
}
