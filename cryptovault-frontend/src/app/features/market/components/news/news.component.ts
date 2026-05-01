import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Shield, ExternalLink, Clock, TrendingUp, Search, Bell, Settings, LogOut } from 'lucide-angular';
import { RouterLink } from '@angular/router';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  category: string;
  image_url?: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
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
            <a routerLink="/market" class="menu-item active">Market</a>
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

      <main class="news-layout container">
        <header class="section-header mb-10">
          <h1 class="text-4xl font-bold mb-4">Latest Market News</h1>
          <p class="text-secondary text-lg">Live updates and expert analysis from the crypto world</p>
        </header>

        <div class="category-filters flex gap-4 mb-10 overflow-x-auto pb-2">
          @for (cat of categories; track cat) {
            <button 
              class="category-pill" 
              [class.active]="selectedCategory === cat"
              (click)="filterByCategory(cat)">
              {{ cat }}
            </button>
          }
        </div>

        @if (isLoading) {
          <div class="flex justify-center items-center py-20">
            <div class="spinner"></div>
          </div>
        } @else {
          <div class="news-grid">
            @for (news of filteredNews; track news.id) {
              <div class="news-card glass">
                <img [src]="news.image_url" class="news-image" alt="news image">
                <div class="news-content">
                  <div class="news-meta">
                    <span class="news-category">{{ news.category }}</span>
                    <span class="flex items-center gap-1 text-secondary">
                      <lucide-icon [name]="clock" size="14"></lucide-icon>
                      {{ formatDate(news.published_at) }}
                    </span>
                  </div>
                  <h2 class="news-title">{{ news.title }}</h2>
                  <p class="news-excerpt">{{ news.description }}</p>
                  <div class="news-footer">
                    <span class="source-tag">Source: {{ news.source }}</span>
                    <a [href]="news.url" target="_blank" class="btn btn-ghost glass !p-2">
                      <lucide-icon [name]="externalLink" size="18"></lucide-icon>
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styleUrls: ['./news.component.scss', '../../../dashboard/dashboard.component.scss']
})
export class NewsComponent implements OnInit {
  shield = Shield;
  externalLink = ExternalLink;
  clock = Clock;
  bell = Bell;
  settings = Settings;
  logOut = LogOut;

  news: NewsItem[] = [];
  filteredNews: NewsItem[] = [];
  categories = ['All', 'Market', 'Technology', 'DeFi', 'Policy', 'NFTs'];
  selectedCategory = 'All';
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchNews();
  }

  fetchNews() {
    this.isLoading = true;
    this.http.get<NewsItem[]>('http://localhost:3000/api/news').subscribe({
      next: (data) => {
        this.news = data;
        this.filteredNews = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredNews = this.news;
    } else {
      this.filteredNews = this.news.filter(n => n.category.toLowerCase() === category.toLowerCase());
    }
  }

  formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
