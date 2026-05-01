import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Shield, AlertCircle, Check, User, ShieldCheck } from 'lucide-angular';
import { AuthService, RegisterRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="auth-layout animate-fade-in">
      <div class="auth-card glass">
        <div class="auth-header">
          <div class="auth-logo">
            <lucide-icon [name]="shield" size="32"></lucide-icon>
          </div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join 10M+ users managing assets on CryptoVault</p>
        </div>

        <div class="role-selector mb-8">
          <button 
            type="button" 
            class="role-btn" 
            [class.active]="selectedRole === 'USER'"
            (click)="setRole('USER')">
            <lucide-icon [name]="userIcon" size="18"></lucide-icon>
            <span>As User</span>
          </button>
          <button 
            type="button" 
            class="role-btn" 
            [class.active]="selectedRole === 'ADMIN'"
            (click)="setRole('ADMIN')">
            <lucide-icon [name]="adminIcon" size="18"></lucide-icon>
            <span>As Admin</span>
          </button>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              type="text"
              formControlName="fullName"
              class="form-input"
              [class.error]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
              placeholder="John Doe"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              type="email"
              formControlName="email"
              class="form-input"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="name@company.com"
            >
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                class="form-input"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                placeholder="••••••••"
                (input)="checkPasswordStrength()"
              >
              <button type="button" class="input-icon-right" (click)="togglePassword()">
                <lucide-icon [name]="showPassword ? eyeOff : eye" size="20"></lucide-icon>
              </button>
            </div>
            
            @if (registerForm.get('password')?.value) {
              <div class="strength-meter">
                <div class="strength-bar-bg">
                  <div 
                    class="strength-bar"
                    [style.width.%]="passwordStrengthPercentage"
                    [style.background]="passwordStrengthBarColor"
                  ></div>
                </div>
                <span class="strength-text" [style.color]="passwordStrengthBarColor">
                  {{ passwordStrengthText }}
                </span>
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input
              type="password"
              formControlName="confirmPassword"
              class="form-input"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              placeholder="••••••••"
            >
          </div>

          <div class="form-group">
            <label class="checkbox-group">
              <input type="checkbox" formControlName="agreeTerms">
              <span class="text-sm">I agree to the <a href="#" class="link">Terms</a> and <a href="#" class="link">Privacy</a></span>
            </label>
          </div>

          @if (errorMessage) {
            <div class="form-error mb-4 p-3 bg-error/10 rounded-lg border border-error/20">
              <lucide-icon [name]="alertCircle" size="18"></lucide-icon>
              <span>{{ errorMessage }}</span>
            </div>
          }

          @if (successMessage) {
            <div class="form-success mb-4 p-3 bg-success/10 rounded-lg border border-success/20 text-success flex items-center gap-2">
              <lucide-icon [name]="check" size="18"></lucide-icon>
              <span>{{ successMessage }}</span>
            </div>
          }

          <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || isLoading">
            @if (isLoading) {
              <div class="spinner"></div>
              <span>Creating Account...</span>
            } @else {
              <span>Register as {{ selectedRole }}</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login" class="link">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../auth.shared.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  selectedRole: 'USER' | 'ADMIN' = 'USER';
  passwordStrengthPercentage = 0;
  passwordStrengthText = '';
  passwordStrengthBarColor = '';
  
  shield = Shield;
  eye = Eye;
  eyeOff = EyeOff;
  alertCircle = AlertCircle;
  check = Check;
  userIcon = User;
  adminIcon = ShieldCheck;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  setRole(role: 'USER' | 'ADMIN'): void {
    this.selectedRole = role;
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    this.passwordStrengthPercentage = strength;
    if (strength <= 25) {
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthBarColor = '#ef4444';
    } else if (strength <= 50) {
      this.passwordStrengthText = 'Fair';
      this.passwordStrengthBarColor = '#f59e0b';
    } else if (strength <= 75) {
      this.passwordStrengthText = 'Good';
      this.passwordStrengthBarColor = '#3b82f6';
    } else {
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthBarColor = '#10b981';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: any = {
      ...this.registerForm.value,
      role: this.selectedRole
    };

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
