import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Settings, LogOut, Shield, DollarSign, Activity } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styles: []
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
  }
}
