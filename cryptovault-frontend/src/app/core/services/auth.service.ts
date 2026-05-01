import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_2fa_enabled: boolean;
  kyc_level: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  country?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.getUserFromToken(token);
      if (user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.setTokens(response.access_token, response.refresh_token);
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refresh_token: refreshToken }).subscribe();
    }
    
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<{ access_token: string; refresh_token: string; expires_in: number }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    return this.http.post<{ access_token: string; refresh_token: string; expires_in: number }>(
      `${this.API_URL}/refresh`, 
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        this.setTokens(response.access_token, response.refresh_token);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private getUserFromToken(token: string): User | null {
    try {
      const decoded: any = jwtDecode(token);
      // The JWT token only contains userId, other user details should be fetched from API
      // This is a placeholder that will be replaced with actual user data on login
      return {
        id: decoded.userId,
        email: '',
        full_name: '',
        is_2fa_enabled: false,
        kyc_level: 'LEVEL_0'
      };
    } catch {
      return null;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  setup2FA(): Observable<{ secret: string; qrCode: string; manualEntryKey: string }> {
    return this.http.post<{ secret: string; qrCode: string; manualEntryKey: string }>(
      `${this.API_URL}/2fa/setup`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  verify2FA(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/2fa/verify`,
      { token },
      { headers: this.getAuthHeaders() }
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, {
      token,
      new_password: newPassword
    });
  }
}
