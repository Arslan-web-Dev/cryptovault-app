import { Routes } from '@angular/router';

export const WALLET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./wallet.component').then(m => m.WalletComponent),
    title: 'Wallet - CryptoVault Pro'
  }
];
