import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicComponent } from './features/public/public.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    title: 'CryptoVault Pro - Secure Crypto Management'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login - CryptoVault Pro'
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register - CryptoVault Pro'
      }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard - CryptoVault Pro'
  },
  {
    path: 'wallet',
    loadChildren: () => import('./features/wallet/wallet.routes').then(m => m.WALLET_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'market',
    loadChildren: () => import('./features/market/market.routes').then(m => m.MARKET_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'portfolio',
    loadChildren: () => import('./features/portfolio/portfolio.routes').then(m => m.PORTFOLIO_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
