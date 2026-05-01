import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Bell, Settings, LogOut, PieChart, BarChart2, Zap, Target, ArrowUpRight, ArrowDownRight } from 'lucide-angular';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NavbarComponent],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <app-navbar></app-navbar>

      <main class="portfolio-layout container">
        <header class="portfolio-header">
          <h1 class="portfolio-title">Portfolio Analytics</h1>
          <p class="text-secondary">Deep dive into your asset performance and allocation</p>
        </header>

        <section class="analytics-grid">
          <div class="main-chart-card glass">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-secondary text-sm mb-1">Growth Overview</div>
                <div class="text-2xl font-bold">+128.45% <span class="text-success text-sm font-normal">All Time</span></div>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-ghost px-3 py-1 text-xs">1W</button>
                <button class="btn btn-ghost px-3 py-1 text-xs active">1M</button>
                <button class="btn btn-ghost px-3 py-1 text-xs">1Y</button>
                <button class="btn btn-ghost px-3 py-1 text-xs">ALL</button>
              </div>
            </div>
            <div class="chart-placeholder"></div>
          </div>

          <div class="section-card glass">
            <div class="text-center">
              <div class="text-secondary text-sm mb-2">Asset Allocation</div>
              <div class="donut-placeholder"></div>
              <div class="space-y-4 text-left mt-8">
                <div class="flex justify-between text-sm">
                  <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-accent-blue"></div> Bitcoin</span>
                  <span class="font-bold">50.4%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-accent-purple"></div> Ethereum</span>
                  <span class="font-bold">44.5%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-warning"></div> Others</span>
                  <span class="font-bold">5.1%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="insights-grid">
          <div class="insight-card glass">
            <div class="insight-icon">
              <lucide-icon [name]="zap"></lucide-icon>
            </div>
            <div>
              <div class="font-bold">Top Performer</div>
              <div class="text-success text-sm">+24.5% (SOL)</div>
            </div>
          </div>
          
          <div class="insight-card glass">
            <div class="insight-icon">
              <lucide-icon [name]="target"></lucide-icon>
            </div>
            <div>
              <div class="font-bold">Portfolio Health</div>
              <div class="text-accent-blue text-sm">Excellent</div>
            </div>
          </div>
          
          <div class="insight-card glass">
            <div class="insight-icon">
              <lucide-icon [name]="barChart2"></lucide-icon>
            </div>
            <div>
              <div class="font-bold">Total PnL</div>
              <div class="text-success text-sm">+\$1,245.00</div>
            </div>
          </div>
        </section>

        <section class="assets-section mt-12">
          <h2 class="section-title mb-6">Holding History</h2>
          <div class="table-card glass">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Entry Price</th>
                  <th>Current Price</th>
                  <th>Profit / Loss</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BTC / USD</td>
                  <td>\$32,450.00</td>
                  <td>\$42,156.32</td>
                  <td><span class="text-success font-bold">+\$9,706.32</span></td>
                  <td><button class="link">Details</button></td>
                </tr>
                <tr>
                  <td>ETH / USD</td>
                  <td>\$2,450.00</td>
                  <td>\$2,234.56</td>
                  <td><span class="text-error font-bold">-\$215.44</span></td>
                  <td><button class="link">Details</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./portfolio.component.scss', '../dashboard/dashboard.component.scss']
})
export class PortfolioComponent {
  shield = Shield;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  pieChart = PieChart;
  barChart2 = BarChart2;
  zap = Zap;
  target = Target;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;
}
