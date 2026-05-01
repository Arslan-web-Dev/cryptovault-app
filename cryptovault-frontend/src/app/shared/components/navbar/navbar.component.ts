import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Shield, Bell, Settings, LogOut, LayoutDashboard, Wallet, TrendingUp, PieChart, Zap, Newspaper } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="dashboard-nav glass">
      <div class="container nav-container">
        <div class="nav-brand" routerLink="/">
          <div class="brand-icon">
            <lucide-icon [name]="shield"></lucide-icon>
          </div>
          <span>{{ isAdmin ? 'Admin Panel' : 'CryptoVault Pro' }}</span>
        </div>
        
        <div class="nav-menu">
          @if (!isAdmin) {
            <a routerLink="/dashboard" routerLinkActive="active" class="menu-item">
              <lucide-icon [name]="dashboardIcon" size="18"></lucide-icon>
              <span>Dashboard</span>
            </a>
            <a routerLink="/wallet" routerLinkActive="active" class="menu-item">
              <lucide-icon [name]="walletIcon" size="18"></lucide-icon>
              <span>Wallet</span>
            </a>
            <a routerLink="/market" routerLinkActive="active" class="menu-item">
              <lucide-icon [name]="marketIcon" size="18"></lucide-icon>
              <span>Market</span>
            </a>
            <a routerLink="/market/news" routerLinkActive="active" class="menu-item">
              <lucide-icon [name]="newsIcon" size="18"></lucide-icon>
              <span>News</span>
            </a>
            <a routerLink="/staking" routerLinkActive="active" class="menu-item">
              <lucide-icon [name]="stakingIcon" size="18"></lucide-icon>
              <span>Staking</span>
            </a>
          } @else {
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="menu-item">
              <lucide-icon [name]="dashboardIcon" size="18"></lucide-icon>
              <span>Overview</span>
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" class="menu-item">
              <span>Users</span>
            </a>
            <a routerLink="/admin/nodes" routerLinkActive="active" class="menu-item">
              <span>Nodes</span>
            </a>
          }
        </div>
        
        <div class="nav-actions">
          <button class="action-btn" routerLink="/notifications">
            <lucide-icon [name]="bell" size="20"></lucide-icon>
            <span class="notification-dot" *ngIf="hasNotifications"></span>
          </button>
          <button class="action-btn" routerLink="/settings">
            <lucide-icon [name]="settings" size="20"></lucide-icon>
          </button>
          <button class="action-btn" (click)="logout()">
            <lucide-icon [name]="logOut" size="20"></lucide-icon>
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .dashboard-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 1rem 0;
    }
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 800;
      font-size: 1.25rem;
      cursor: pointer;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: var(--accent-blue);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }
    .nav-menu {
      display: flex;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.4rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      color: var(--text-secondary);
      font-weight: 600;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .menu-item:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
    .menu-item.active {
      color: #fff;
      background: var(--accent-blue);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .nav-actions {
      display: flex;
      gap: 0.75rem;
    }
    .action-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
    }
    .action-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-color: var(--accent-blue);
    }
    .notification-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid #0a0b10;
    }
  `]
})
export class NavbarComponent implements OnInit {
  @Input() isAdmin = false;
  hasNotifications = true;

  shield = Shield;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  dashboardIcon = LayoutDashboard;
  walletIcon = Wallet;
  marketIcon = TrendingUp;
  portfolioIcon = PieChart;
  stakingIcon = Zap;
  newsIcon = Newspaper;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
