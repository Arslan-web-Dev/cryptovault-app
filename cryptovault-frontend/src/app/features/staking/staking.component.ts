import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Bell, Settings, LogOut, Zap, Clock, Info, ArrowUpRight } from 'lucide-angular';

@Component({
  selector: 'app-staking',
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
            <a routerLink="/market" class="menu-item">Market</a>
            <a routerLink="/portfolio" class="menu-item">Portfolio</a>
            <a routerLink="/staking" class="menu-item active">Staking</a>
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

      <main class="staking-layout container">
        <header class="staking-hero">
          <div>
            <h1 class="text-4xl font-bold mb-2">Earn up to 15% APY</h1>
            <p class="text-white/80">Stake your idle assets and grow your portfolio effortlessly.</p>
          </div>
          <div class="hidden md:block">
            <lucide-icon [name]="zap" size="64" class="text-white/20"></lucide-icon>
          </div>
        </header>

        <div class="section-header flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold">Staking Opportunities</h2>
          <div class="flex gap-4">
            <span class="text-secondary text-sm flex items-center gap-2">
              <lucide-icon [name]="info" size="14"></lucide-icon>
              Total Staked: $2.4M
            </span>
          </div>
        </div>

        <div class="staking-grid">
          @for (pool of stakingPools; track pool.symbol) {
            <div class="staking-card glass">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-3">
                  <div class="asset-icon-sm" [style.background]="pool.color">
                    {{ pool.symbol.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-lg">{{ pool.name }}</div>
                    <div class="text-secondary text-sm">{{ pool.symbol }}</div>
                  </div>
                </div>
                <span class="apy-badge">{{ pool.apy }}% APY</span>
              </div>

              <div class="staking-info">
                <div>
                  <span class="info-label">Lock Period</span>
                  <span class="info-value flex items-center gap-2">
                    <lucide-icon [name]="clock" size="14"></lucide-icon>
                    {{ pool.lockPeriod }} Days
                  </span>
                </div>
                <div>
                  <span class="info-label">Min. Amount</span>
                  <span class="info-value">{{ pool.minAmount }} {{ pool.symbol }}</span>
                </div>
              </div>

              <div class="bg-white/5 rounded-xl p-4 mb-6">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-secondary">Estimated Rewards</span>
                  <span class="text-success font-bold">+{{ pool.estReward }} {{ pool.symbol }}/mo</span>
                </div>
                <div class="w-100 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div class="h-100 bg-accent-purple" [style.width.%]="70"></div>
                </div>
              </div>

              <button class="btn-stake">
                Stake Now
                <lucide-icon [name]="arrowUpRight" size="18" class="ml-2 inline"></lucide-icon>
              </button>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./staking.component.scss', '../dashboard/dashboard.component.scss']
})
export class StakingComponent {
  shield = Shield;
  zap = Zap;
  clock = Clock;
  info = Info;
  arrowUpRight = ArrowUpRight;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;

  stakingPools = [
    { name: 'Ethereum 2.0', symbol: 'ETH', apy: '4.5', lockPeriod: 'Flexible', minAmount: '0.1', estReward: '0.004', color: '#627eea' },
    { name: 'Solana', symbol: 'SOL', apy: '7.2', lockPeriod: '30', minAmount: '1.0', estReward: '0.6', color: '#00d4aa' },
    { name: 'Cardano', symbol: 'ADA', apy: '5.1', lockPeriod: '15', minAmount: '100', estReward: '4.2', color: '#0033ad' },
    { name: 'Polkadot', symbol: 'DOT', apy: '12.8', lockPeriod: '28', minAmount: '5.0', estReward: '0.53', color: '#e6007a' },
    { name: 'Polygon', symbol: 'MATIC', apy: '6.4', lockPeriod: 'Flexible', minAmount: '50', estReward: '2.6', color: '#8247e5' },
    { name: 'Cosmos', symbol: 'ATOM', apy: '14.2', lockPeriod: '21', minAmount: '1.0', estReward: '0.12', color: '#2e3148' }
  ];
}
