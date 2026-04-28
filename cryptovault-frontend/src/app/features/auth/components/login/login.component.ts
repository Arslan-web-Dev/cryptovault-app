import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Shield, AlertCircle } from 'lucide-angular';
import { AuthService, LoginRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <lucide-icon [name]="shield" class="w-10 h-10 text-white"></lucide-icon>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p class="text-gray-400">Sign in to your CryptoVault Pro account</p>
        </div>

        <!-- Login Form -->
        <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email Field -->
            <div class="mb-6">
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              >
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  @if (loginForm.get('email')?.errors?.['required']) {
                    Email is required
                  } @else if (loginForm.get('email')?.errors?.['email']) {
                    Please enter a valid email
                  }
                </div>
              }
            </div>

            <!-- Password Field -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                >
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <lucide-icon [name]="showPassword ? eyeOff : eye" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  Password is required
                </div>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-blue-500 focus:ring-blue-500 focus:ring-2"
                >
                <span class="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <a href="#" class="text-sm text-blue-400 hover:text-blue-300 transition">
                Forgot password?
              </a>
            </div>

            <!-- Error Message -->
            @if (errorMessage) {
              <div class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <div class="flex items-center text-red-400">
                  <lucide-icon [name]="alertCircle" class="w-5 h-5 mr-2"></lucide-icon>
                  {{ errorMessage }}
                </div>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-[1.02] disabled:scale-100"
            >
              @if (isLoading) {
                <div class="flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              } @else {
                Sign In
              }
            </button>
          </form>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-600/50"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-800/50 text-gray-400">Or continue with</span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="space-y-3">
            <button class="w-full bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button class="w-full bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          <!-- Register Link -->
          <div class="mt-8 text-center">
            <p class="text-gray-400">
              Don't have an account?
              <a routerLink="/auth/register" class="text-blue-400 hover:text-blue-300 font-medium transition">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  shield = Shield;
  eye = Eye;
  eyeOff = EyeOff;
  alertCircle = AlertCircle;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    this.authService.login(loginData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
