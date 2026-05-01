import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, TrendingUp, Lock, Globe, Star, ArrowUpRight, ArrowDownRight } from 'lucide-angular';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="public-layout">
      <!-- Navigation -->
      <nav class="navbar glass">
        <div class="container navbar-container">
          <div class="logo">
            <div class="logo-icon">
              <lucide-icon [name]="shield"></lucide-icon>
            </div>
            <span>CryptoVault Pro</span>
          </div>
          
          <div class="nav-links">
            <a href="#features" class="nav-link">Features</a>
            <a href="#market" class="nav-link">Market</a>
            <a href="#security" class="nav-link">Security</a>
            <a href="#about" class="nav-link">About</a>
          </div>

          <div class="nav-actions">
            <a routerLink="/auth/login" class="btn btn-ghost">Login</a>
            <a routerLink="/auth/register" class="btn btn-primary">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="hero container animate-fade-in">
        <div class="hero-badge">
          <lucide-icon [name]="star" size="14"></lucide-icon>
          <span>Trusted by 10M+ users worldwide</span>
        </div>
        <h1 class="hero-title">
          Secure Crypto <br />
          <span class="gradient-text">Management</span>
        </h1>
        <p class="hero-subtitle">
          The next-generation wallet platform. Trade, store, and grow your crypto 
          assets with institutional-grade security and ease.
        </p>
        <div class="hero-actions">
          <a routerLink="/auth/register" class="btn btn-primary btn-lg">Start Building Portfolio</a>
          <a href="#features" class="btn btn-ghost btn-lg">Explore Features</a>
        </div>
      </section>

      <!-- Market Ticker -->
      <section id="market" class="market-ticker">
        <div class="ticker-wrapper">
          @for (coin of coins; track coin.symbol) {
            <div class="ticker-item">
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-price">{{ coin.price }}</span>
              <span class="coin-change" [class.up]="coin.up" [class.down]="!coin.up">
                <lucide-icon [name]="coin.up ? arrowUpRight : arrowDownRight" size="16"></lucide-icon>
                {{ coin.change }}
              </span>
            </div>
          }
          <!-- Repeat for smooth scroll -->
          @for (coin of coins; track coin.symbol + '-copy') {
            <div class="ticker-item">
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-price">{{ coin.price }}</span>
              <span class="coin-change" [class.up]="coin.up" [class.down]="!coin.up">
                <lucide-icon [name]="coin.up ? arrowUpRight : arrowDownRight" size="16"></lucide-icon>
                {{ coin.change }}
              </span>
            </div>
          }
        </div>
      </section>

      <!-- Features Grid -->
      <section id="features" class="features container">
        <div class="section-header animate-fade-in">
          <h2 class="section-title">The Vault Experience</h2>
          <p class="text-secondary">Engineered for security, designed for speed.</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card glass">
            <div class="feature-icon">
              <lucide-icon [name]="shield"></lucide-icon>
            </div>
            <h3 class="feature-title">Multi-Sig Security</h3>
            <p class="feature-desc">Institutional-grade security with multi-signature technology and cold storage integration.</p>
          </div>
          
          <div class="feature-card glass">
            <div class="feature-icon">
              <lucide-icon [name]="trendingUp"></lucide-icon>
            </div>
            <h3 class="feature-title">Real-time Analytics</h3>
            <p class="feature-desc">Track your performance across multiple chains with advanced charting and insights.</p>
          </div>
          
          <div class="feature-card glass">
            <div class="feature-icon">
              <lucide-icon [name]="globe"></lucide-icon>
            </div>
            <h3 class="feature-title">Global Accessibility</h3>
            <p class="feature-desc">Access your assets from anywhere in the world, with support for 150+ countries.</p>
          </div>
          
          <div class="feature-card glass">
            <div class="feature-icon">
              <lucide-icon [name]="lock"></lucide-icon>
            </div>
            <h3 class="feature-title">Privacy Focused</h3>
            <p class="feature-desc">Your keys, your crypto. We never store your private keys or personal data on our servers.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="logo">
                <div class="logo-icon">
                  <lucide-icon [name]="shield"></lucide-icon>
                </div>
                <span>CryptoVault Pro</span>
              </div>
              <p class="footer-logo-desc">Building the future of decentralized finance since 2024.</p>
            </div>
            
            <div class="footer-column">
              <h4 class="footer-title">Platform</h4>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">Exchange</a></li>
                <li><a href="#" class="footer-link">Wallets</a></li>
                <li><a href="#" class="footer-link">Staking</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4 class="footer-title">Company</h4>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">About Us</a></li>
                <li><a href="#" class="footer-link">Careers</a></li>
                <li><a href="#" class="footer-link">Contact</a></li>
              </ul>
            </div>
            
            <div class="footer-column">
              <h4 class="footer-title">Legal</h4>
              <ul class="footer-links">
                <li><a href="#" class="footer-link">Privacy Policy</a></li>
                <li><a href="#" class="footer-link">Terms of Service</a></li>
                <li><a href="#" class="footer-link">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 CryptoVault Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {
  shield = Shield;
  trendingUp = TrendingUp;
  lock = Lock;
  globe = Globe;
  star = Star;
  arrowUpRight = ArrowUpRight;
  arrowDownRight = ArrowDownRight;

  coins = [
    { symbol: 'BTC', price: '$42,156.32', change: '+2.5%', up: true },
    { symbol: 'ETH', price: '$2,234.56', change: '-1.2%', up: false },
    { symbol: 'SOL', price: '$95.67', change: '+5.1%', up: true },
    { symbol: 'BNB', price: '$312.45', change: '+0.8%', up: true },
    { symbol: 'XRP', price: '$0.52', change: '-2.1%', up: false },
    { symbol: 'ADA', price: '$0.48', change: '+1.5%', up: true },
  ];
}
