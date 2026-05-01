import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Users, Database, ShieldAlert, Activity, Bell, Settings, LogOut, ArrowUpRight, Search, Filter, MoreVertical } from 'lucide-angular';

@Component({
  selector: 'app-admin',
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
            <span>Vault Admin</span>
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

      <div class="container admin-layout grid grid-cols-[250px_1fr] gap-8">
        <aside class="sidebar-nav-vertical">
          <a class="admin-menu-item active">
            <lucide-icon [name]="activity" size="18"></lucide-icon>
            System Health
          </a>
          <a class="admin-menu-item">
            <lucide-icon [name]="users" size="18"></lucide-icon>
            User Management
          </a>
          <a class="admin-menu-item">
            <lucide-icon [name]="shieldAlert" size="18"></lucide-icon>
            Security Audits
          </a>
          <a class="admin-menu-item">
            <lucide-icon [name]="database" size="18"></lucide-icon>
            Node Status
          </a>
        </aside>

        <main>
          <header class="admin-header">
            <h1 class="admin-title">System Overview</h1>
            <p class="text-secondary">Global metrics and platform status</p>
          </header>

          <section class="admin-stats">
            <div class="admin-card glass">
              <div class="text-secondary text-sm mb-2">Total Users</div>
              <div class="text-3xl font-bold">1.2M</div>
              <div class="text-success text-xs mt-2">+12k today</div>
            </div>
            <div class="admin-card glass">
              <div class="text-secondary text-sm mb-2">Total TVL</div>
              <div class="text-3xl font-bold">\$4.5B</div>
              <div class="text-success text-xs mt-2">+5.2% 24h</div>
            </div>
            <div class="admin-card glass">
              <div class="text-secondary text-sm mb-2">Node Latency</div>
              <div class="text-3xl font-bold">12ms</div>
              <div class="text-success text-xs mt-2">Optimal</div>
            </div>
          </section>

          <section class="user-table-section">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Recent Signups</h2>
              <div class="flex gap-4">
                <div class="search-box glass">
                  <lucide-icon [name]="search" size="18"></lucide-icon>
                  <input type="text" placeholder="Search users...">
                </div>
              </div>
            </div>

            <div class="table-card glass">
              <table class="premium-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>KYC</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of recentUsers; track user.email) {
                    <tr>
                      <td><div class="font-bold">{{ user.name }}</div></td>
                      <td>{{ user.email }}</td>
                      <td><span class="user-status active">Active</span></td>
                      <td><span class="user-status" [class.active]="user.kyc === 'Verified'" [class.pending]="user.kyc === 'Pending'">{{ user.kyc }}</span></td>
                      <td class="text-secondary">{{ user.joined }}</td>
                      <td>
                        <button class="action-btn">
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
    </div>
  `,
  styleUrls: ['./admin.component.scss', '../dashboard/dashboard.component.scss']
})
export class AdminComponent {
  shield = Shield;
  users = Users;
  database = Database;
  shieldAlert = ShieldAlert;
  activity = Activity;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;
  search = Search;
  moreVertical = MoreVertical;

  recentUsers = [
    { name: 'Arslan Dev', email: 'arslan59191@gmail.com', kyc: 'Verified', joined: '2 hours ago' },
    { name: 'Jane Smith', email: 'jane@example.com', kyc: 'Pending', joined: '5 hours ago' },
    { name: 'Bob Johnson', email: 'bob@example.com', kyc: 'Verified', joined: '1 day ago' },
    { name: 'Alice Williams', email: 'alice@example.com', kyc: 'Verified', joined: '2 days ago' }
  ];
}
