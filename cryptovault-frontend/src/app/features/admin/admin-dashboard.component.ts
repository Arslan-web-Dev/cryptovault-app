import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Users, Activity, Settings, LogOut, Bell, Check, X, ShieldAlert, BarChart3, Database } from 'lucide-angular';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NavbarComponent],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <app-navbar [isAdmin]="true"></app-navbar>

      <main class="dashboard-content container">
        <header class="section-header">
          <h1 class="text-3xl font-bold">System Overview</h1>
          <p class="text-secondary">Manage users, nodes, and global settings</p>
        </header>

        <div class="stats-grid mb-12">
          <div class="stat-card glass">
            <div class="stat-header">
              <span class="stat-label">Total Users</span>
              <lucide-icon [name]="usersIcon" class="text-blue-500"></lucide-icon>
            </div>
            <div class="stat-value">12,842</div>
            <div class="stat-change positive">+240 this week</div>
          </div>

          <div class="stat-card glass">
            <div class="stat-header">
              <span class="stat-label">Active Nodes</span>
              <lucide-icon [name]="database" class="text-purple-500"></lucide-icon>
            </div>
            <div class="stat-value">34</div>
            <div class="stat-change">All systems online</div>
          </div>

          <div class="stat-card glass">
            <div class="stat-header">
              <span class="stat-label">Total Volume (24h)</span>
              <lucide-icon [name]="barChart" class="text-green-500"></lucide-icon>
            </div>
            <div class="stat-value">$1.4M</div>
            <div class="stat-change positive">+12.5%</div>
          </div>

          <div class="stat-card glass">
            <div class="stat-header">
              <span class="stat-label">Pending Approvals</span>
              <lucide-icon [name]="shieldAlert" class="text-amber-500"></lucide-icon>
            </div>
            <div class="stat-value text-amber-500">{{ pendingUsers.length }}</div>
            <div class="stat-change">Requires action</div>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <section class="glass p-8 rounded-3xl">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <lucide-icon [name]="shieldAlert" size="20"></lucide-icon>
              Approval Queue
            </h2>
            <div class="space-y-4">
              @for (user of pendingUsers; track user.id) {
                <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                  <div class="flex items-center gap-4">
                    <div class="avatar-sm">{{ user.name.charAt(0) }}</div>
                    <div>
                      <div class="font-bold">{{ user.name }}</div>
                      <div class="text-sm text-secondary">{{ user.email }}</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn btn-icon bg-success/20 text-success" (click)="approve(user.id)">
                      <lucide-icon [name]="check" size="18"></lucide-icon>
                    </button>
                    <button class="btn btn-icon bg-error/20 text-error">
                      <lucide-icon [name]="x" size="18"></lucide-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="glass p-8 rounded-3xl">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <lucide-icon [name]="activity" size="20"></lucide-icon>
              System Logs
            </h2>
            <div class="space-y-4">
              @for (log of systemLogs; track log.id) {
                <div class="flex items-center gap-4 p-3 border-b border-white/5 last:border-0">
                  <div class="text-xs text-secondary font-mono">{{ log.time }}</div>
                  <div class="text-sm">
                    <span class="font-bold text-blue-400">{{ log.admin }}</span>
                    {{ log.action }}
                    <span class="font-bold">{{ log.target }}</span>
                  </div>
                </div>
              }
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['../dashboard/dashboard.component.scss']
})
export class AdminDashboardComponent {
  shield = Shield;
  usersIcon = Users;
  database = Database;
  barChart = BarChart3;
  shieldAlert = ShieldAlert;
  activity = Activity;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  check = Check;
  x = X;

  pendingUsers = [
    { id: '1', name: 'James Wilson', email: 'james.w@example.com' },
    { id: '2', name: 'Sarah Connor', email: 's.connor@sky.net' },
    { id: '3', name: 'Mike Ross', email: 'm.ross@pearson.com' }
  ];

  systemLogs = [
    { id: '1', time: '10:24', admin: 'Arslan Admin', action: 'approved user', target: 'John Doe' },
    { id: '2', time: '09:45', admin: 'System', action: 'restarted node', target: 'ETH-Mainnet-01' },
    { id: '3', time: '08:12', admin: 'Arslan Admin', action: 'updated fees', target: 'Swap Pool' }
  ];

  approve(userId: string) {
    this.pendingUsers = this.pendingUsers.filter(u => u.id !== userId);
  }
}
