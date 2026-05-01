import { Routes } from '@angular/router';

export const MARKET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./market.component').then(m => m.MarketComponent),
    title: 'Market - CryptoVault Pro'
  },
  {
    path: 'news',
    loadComponent: () => import('./components/news/news.component').then(m => m.NewsComponent),
    title: 'Crypto News - CryptoVault Pro'
  }
];
