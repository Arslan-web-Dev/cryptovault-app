import { Routes } from '@angular/router';

export const STAKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./staking.component').then(m => m.StakingComponent),
    title: 'Staking - CryptoVault Pro'
  }
];
