import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Eye, EyeOff, Shield, AlertCircle, Check } from 'lucide-angular';
import { AuthService, RegisterRequest } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div class="max-w-md w-full">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <lucide-icon [name]="shield" class="w-10 h-10 text-white"></lucide-icon>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p class="text-gray-400">Join CryptoVault Pro today</p>
        </div>

        <!-- Register Form -->
        <div class="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Full Name Field -->
            <div class="mb-4">
              <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                [class.border-red-500]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
              >
              @if (registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  @if (registerForm.get('fullName')?.errors?.['required']) {
                    Full name is required
                  } @else if (registerForm.get('fullName')?.errors?.['minlength']) {
                    Name must be at least 2 characters
                  }
                </div>
              }
            </div>

            <!-- Email Field -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              >
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  @if (registerForm.get('email')?.errors?.['required']) {
                    Email is required
                  } @else if (registerForm.get('email')?.errors?.['email']) {
                    Please enter a valid email
                  }
                </div>
              }
            </div>

            <!-- Password Field -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Create a strong password"
                  [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  (input)="checkPasswordStrength()"
                >
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  <lucide-icon [name]="showPassword ? eyeOff : eye" class="w-5 h-5"></lucide-icon>
                </button>
              </div>
              
              <!-- Password Strength Meter -->
              @if (registerForm.get('password')?.value) {
                <div class="mt-2">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">Password Strength</span>
                    <span class="text-xs" [class]="passwordStrengthColor">{{ passwordStrengthText }}</span>
                  </div>
                  <div class="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      [class]="passwordStrengthBarClass"
                      [style.width.%]="passwordStrengthPercentage"
                    ></div>
                  </div>
                </div>
              }

              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Password is required
                  } @else if (registerForm.get('password')?.errors?.['minlength']) {
                    Password must be at least 8 characters
                  } @else if (registerForm.get('password')?.errors?.['pattern']) {
                    Password must contain uppercase, lowercase, and number
                  }
                </div>
              }
            </div>

            <!-- Confirm Password Field -->
            <div class="mb-4">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                [class.border-red-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              >
              @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                    Please confirm your password
                  } @else if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                    Passwords do not match
                  }
                </div>
              }
            </div>

            <!-- Phone Field (Optional) -->
            <div class="mb-4">
              <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              >
            </div>

            <!-- Country Field (Optional) -->
            <div class="mb-6">
              <label for="country" class="block text-sm font-medium text-gray-300 mb-2">
                Country (Optional)
              </label>
              <select
                id="country"
                formControlName="country"
                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="IN">India</option>
              </select>
            </div>

            <!-- Terms & Conditions -->
            <div class="mb-6">
              <label class="flex items-start">
                <input
                  type="checkbox"
                  formControlName="agreeTerms"
                  class="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-blue-500 focus:ring-blue-500 focus:ring-2 mt-1"
                >
                <span class="ml-2 text-sm text-gray-300">
                  I agree to the 
                  <a href="#" class="text-blue-400 hover:text-blue-300 transition">Terms of Service</a> 
                  and 
                  <a href="#" class="text-blue-400 hover:text-blue-300 transition">Privacy Policy</a>
                </span>
              </label>
              @if (registerForm.get('agreeTerms')?.invalid && registerForm.get('agreeTerms')?.touched) {
                <div class="mt-2 text-sm text-red-400 flex items-center">
                  <lucide-icon [name]="alertCircle" class="w-4 h-4 mr-1"></lucide-icon>
                  You must agree to the terms and conditions
                </div>
              }
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

            <!-- Success Message -->
            @if (successMessage) {
              <div class="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div class="flex items-center text-green-400">
                  <lucide-icon [name]="check" class="w-5 h-5 mr-2"></lucide-icon>
                  {{ successMessage }}
                </div>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition transform hover:scale-[1.02] disabled:scale-100"
            >
              @if (isLoading) {
                <div class="flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              } @else {
                Create Account
              }
            </button>
          </form>

          <!-- Login Link -->
          <div class="mt-8 text-center">
            <p class="text-gray-400">
              Already have an account?
              <a routerLink="/auth/login" class="text-blue-400 hover:text-blue-300 font-medium transition">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';
  passwordStrengthBarClass = '';
  passwordStrengthPercentage = 0;
  
  shield = Shield;
  eye = Eye;
  eyeOff = EyeOff;
  alertCircle = AlertCircle;
  check = Check;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]],
      confirmPassword: ['', [Validators.required]],
      phone: [''],
      country: [''],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  checkPasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Complexity checks
    if (/[a-z]/.test(password)) strength += 12.5;
    if (/[A-Z]/.test(password)) strength += 12.5;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^a-zA-Z\d]/.test(password)) strength += 12.5;
    
    this.passwordStrength = strength;
    this.passwordStrengthPercentage = Math.min(strength, 100);
    
    if (strength < 30) {
      this.passwordStrengthText = 'Weak';
      this.passwordStrengthColor = 'text-red-400';
      this.passwordStrengthBarClass = 'bg-red-500';
    } else if (strength < 60) {
      this.passwordStrengthText = 'Fair';
      this.passwordStrengthColor = 'text-yellow-400';
      this.passwordStrengthBarClass = 'bg-yellow-500';
    } else if (strength < 80) {
      this.passwordStrengthText = 'Good';
      this.passwordStrengthColor = 'text-blue-400';
      this.passwordStrengthBarClass = 'bg-blue-500';
    } else {
      this.passwordStrengthText = 'Strong';
      this.passwordStrengthColor = 'text-green-400';
      this.passwordStrengthBarClass = 'bg-green-500';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: RegisterRequest = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phone: this.registerForm.value.phone || undefined,
      country: this.registerForm.value.country || undefined
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.isLoading = false;
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
