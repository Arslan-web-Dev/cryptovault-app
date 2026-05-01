import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Bell, CheckCircle, Info, AlertTriangle, ShieldCheck, Clock, Settings, LogOut } from 'lucide-angular';

import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, NavbarComponent],
  template: `
    <div class="dashboard-layout animate-fade-in">
      <app-navbar></app-navbar>

      <main class="notification-layout container">
        <header class="notif-header">
          <div>
            <h1 class="text-3xl font-bold mb-2">Notifications</h1>
            <p class="text-secondary">Stay updated with your account activity and security alerts</p>
          </div>
          <button class="btn btn-ghost glass">Mark all as read</button>
        </header>

        <div class="notif-list">
          @for (notif of notifications; track notif.id) {
            <div class="notif-item glass" [class.unread]="!notif.isRead">
              <div class="notif-icon-box" 
                   [class.bg-success/10]="notif.type === 'success'"
                   [class.bg-error/10]="notif.type === 'security'"
                   [class.bg-blue-500/10]="notif.type === 'info'"
                   [class.text-success]="notif.type === 'success'"
                   [class.text-error]="notif.type === 'security'"
                   [class.text-blue-500]="notif.type === 'info'">
                <lucide-icon 
                  [name]="notif.type === 'success' ? checkCircle : notif.type === 'security' ? shieldCheck : info"
                  size="24">
                </lucide-icon>
              </div>

              <div class="notif-content">
                <h3 class="notif-title">{{ notif.title }}</h3>
                <p class="notif-message">{{ notif.message }}</p>
                <div class="notif-time flex items-center gap-2">
                  <lucide-icon [name]="clock" size="14"></lucide-icon>
                  {{ notif.time }}
                </div>
              </div>

              <div class="notif-actions">
                <button class="action-btn">
                  <lucide-icon [name]="settings" size="16"></lucide-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./notifications.component.scss', '../dashboard/dashboard.component.scss']
})
export class NotificationsComponent {
  shield = Shield;
  bellIcon = Bell;
  checkCircle = CheckCircle;
  info = Info;
  alertTriangle = AlertTriangle;
  shieldCheck = ShieldCheck;
  clock = Clock;
  settings = Settings;
  logOut = LogOut;

  notifications = [
    {
      id: '1',
      type: 'security',
      title: 'New Login Detected',
      message: 'A new login was detected from Chrome on Windows (192.168.1.1). If this wasn\'t you, please secure your account immediately.',
      time: '2 minutes ago',
      isRead: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Staking Reward Received',
      message: 'You have earned 0.004 ETH from your staking position. Keep it up!',
      time: '1 hour ago',
      isRead: false
    },
    {
      id: '3',
      type: 'info',
      title: 'System Maintenance',
      message: 'CryptoVault Pro will undergo scheduled maintenance on May 5th from 02:00 to 04:00 UTC.',
      time: '5 hours ago',
      isRead: true
    },
    {
      id: '4',
      type: 'success',
      title: 'KYC Verified',
      message: 'Congratulations! Your identity verification (KYC Level 1) has been approved by our team.',
      time: '1 day ago',
      isRead: true
    }
  ];
}
