import { Routes } from '@angular/router';

export const WALLET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./wallet.component').then(m => m.WalletComponent),
    title: 'Wallet - CryptoVault Pro'
  },
  {
    path: 'transactions',
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent),
    title: 'Transactions - CryptoVault Pro'
  }
];
