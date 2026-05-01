import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Settings, LogOut, Shield, DollarSign, Activity } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
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
            <a routerLink="/dashboard" class="menu-item active">Dashboard</a>
            <a routerLink="/wallet" class="menu-item">Wallet</a>
            <a routerLink="/market" class="menu-item">Market</a>
            <a routerLink="/portfolio" class="menu-item">Portfolio</a>
          </div>
          
          <div class="nav-actions">
            <button class="action-btn">
              <lucide-icon [name]="bell" size="20"></lucide-icon>
              <span class="notification-dot"></span>
            </button>
            <button class="action-btn">
              <lucide-icon [name]="settings" size="20"></lucide-icon>
            </button>
            <button class="action-btn" (click)="logout()">
              <lucide-icon [name]="logOut" size="20"></lucide-icon>
            </button>
          </div>
        </div>
      </nav>

      <main class="dashboard-content container">
        <header class="welcome-section">
          <h1 class="welcome-title">Welcome back, {{ currentUser?.full_name || 'User' }}!</h1>
          <p class="welcome-subtitle">Your assets are performing well today.</p>
        </header>

        <section class="portfolio-card">
          <div class="portfolio-info">
            <p class="portfolio-label">Total Portfolio Value</p>
            <h2 class="portfolio-value">$ {{ portfolioValue.toLocaleString() }}</h2>
            <div class="portfolio-trend" [class.up]="portfolioChange >= 0" [class.down]="portfolioChange < 0">
              <lucide-icon [name]="portfolioChange >= 0 ? arrowUpRight : arrowDownRight" size="20"></lucide-icon>
              <span>{{ portfolioChange >= 0 ? '+' : '-' }}\${{ absPortfolioChange.toLocaleString() }} ({{ portfolioChangePercent }}%)</span>
              <span class="text-white/60 text-sm font-normal ml-2">Past 24h</span>
            </div>
          </div>
          <div class="card-icon-large">
            <lucide-icon [name]="wallet" size="40"></lucide-icon>
          </div>
        </section>

        <div class="stats-grid">
          <div class="stat-card glass">
            <div class="stat-header">
              <div class="stat-icon bg-success/20 text-success">
                <lucide-icon [name]="dollarSign"></lucide-icon>
              </div>
              <span class="stat-change text-success">+12.5%</span>
            </div>
            <h3 class="stat-value">$ {{ totalProfit.toLocaleString() }}</h3>
            <p class="stat-label">Total Profit</p>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-header">
              <div class="stat-icon bg-accent-blue/20 text-accent-blue">
                <lucide-icon [name]="activity"></lucide-icon>
              </div>
              <span class="stat-change text-accent-blue">Active</span>
            </div>
            <h3 class="stat-value">{{ walletCount }}</h3>
            <p class="stat-label">Wallets Connected</p>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-header">
              <div class="stat-icon bg-accent-purple/20 text-accent-purple">
                <lucide-icon [name]="trendingUp"></lucide-icon>
              </div>
              <span class="stat-change text-accent-purple">+5.2%</span>
            </div>
            <h3 class="stat-value">{{ transactionCount }}</h3>
            <p class="stat-label">Transactions</p>
          </div>
          
          <div class="stat-card glass">
            <div class="stat-header">
              <div class="stat-icon bg-warning/20 text-warning">
                <lucide-icon [name]="shield"></lucide-icon>
              </div>
              <span class="stat-change text-warning">{{ kycLevel }}</span>
            </div>
            <h3 class="stat-value">Identity</h3>
            <p class="stat-label">Verification Level</p>
          </div>
        </div>

        <div class="data-grid">
          <section class="section-card glass">
            <div class="section-header">
              <h3 class="section-title">Asset Allocation</h3>
            </div>
            <div class="allocation-list">
              @for (allocation of portfolioAllocation; track allocation.coin) {
                <div class="allocation-item">
                  <div class="coin-info">
                    <div class="coin-avatar" [style.background]="allocation.color">
                      {{ allocation.coin.charAt(0) }}
                    </div>
                    <div>
                      <span class="coin-name">{{ allocation.coin }}</span>
                      <span class="coin-amount">{{ allocation.amount }} {{ allocation.coin }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="coin-name">$ {{ allocation.value.toLocaleString() }}</span>
                    <span class="coin-amount">{{ allocation.percentage }}%</span>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="section-card glass">
            <div class="section-header">
              <h3 class="section-title">Recent Activity</h3>
              <a routerLink="/wallet" class="link text-sm">View All</a>
            </div>
            <div class="transaction-list">
              @for (tx of recentTransactions; track tx.id) {
                <div class="transaction-item">
                  <div class="coin-info">
                    <div class="tx-icon" [class.bg-success/10]="tx.type === 'receive'" [class.bg-error/10]="tx.type === 'send'">
                      <lucide-icon 
                        [name]="tx.type === 'receive' ? arrowUpRight : arrowDownRight" 
                        [class]="tx.type === 'receive' ? 'text-success' : 'text-error'"
                        size="18">
                      </lucide-icon>
                    </div>
                    <div>
                      <span class="coin-name capitalize">{{ tx.type }} {{ tx.coin }}</span>
                      <span class="coin-amount">{{ tx.date }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="coin-name" [class.text-success]="tx.type === 'receive'" [class.text-error]="tx.type === 'send'">
                      {{ tx.type === 'receive' ? '+' : '-' }} $ {{ tx.amount.toLocaleString() }}
                    </span>
                    <span class="coin-amount">{{ tx.status }}</span>
                  </div>
                </div>
              }
            </div>
          </section>
        </div>

        <section class="quick-actions glass">
          <h3 class="section-title mb-6">Quick Actions</h3>
          <div class="actions-grid">
            <button class="btn-action bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              <lucide-icon [name]="arrowUpRight" size="20"></lucide-icon>
              Send
            </button>
            <button class="btn-action bg-success/10 text-success border border-success/20">
              <lucide-icon [name]="arrowDownRight" size="20"></lucide-icon>
              Receive
            </button>
            <button class="btn-action bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
              <lucide-icon [name]="activity" size="20"></lucide-icon>
              Swap
            </button>
            <button class="btn-action bg-warning/10 text-warning border border-warning/20">
              <lucide-icon [name]="trendingUp" size="20"></lucide-icon>
              Buy
            </button>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  portfolioValue = 12550.00;
  portfolioChange = 550.00;
  portfolioChangePercent = '4.58';
  totalProfit = 1250.00;
  walletCount = 3;
  transactionCount = 24;
  kycLevel = 'Level 1';
  
  get absPortfolioChange(): number {
    return Math.abs(this.portfolioChange);
  }
  
  portfolioAllocation = [
    { coin: 'BTC', amount: '0.15', value: 6323.45, percentage: '50.4', color: '#f7931a' },
    { coin: 'ETH', amount: '2.5', value: 5586.40, percentage: '44.5', color: '#627eea' },
    { coin: 'SOL', amount: '10', value: 956.70, percentage: '7.6', color: '#00d4aa' },
    { coin: 'USDT', amount: '183.45', value: 183.45, percentage: '1.5', color: '#26a17b' }
  ];
  
  recentTransactions = [
    { id: 1, type: 'receive', coin: 'BTC', amount: 0.025, date: '2 hours ago', status: 'Completed' },
    { id: 2, type: 'send', coin: 'ETH', amount: 0.5, date: '1 day ago', status: 'Completed' },
    { id: 3, type: 'swap', coin: 'SOL', amount: 5, date: '2 days ago', status: 'Completed' },
    { id: 4, type: 'receive', coin: 'USDT', amount: 100, date: '3 days ago', status: 'Completed' }
  ];

  shield = Shield;
  wallet = Wallet;
  trendingUp = TrendingUp;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  dollarSign = DollarSign;
  activity = Activity;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
