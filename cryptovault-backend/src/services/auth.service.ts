import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/database';
import redisService from '../config/redis';
import { createError } from '../middleware/error.middleware';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  country?: string;
}

class AuthService {
  private readonly jwtSecret = process.env['JWT_SECRET']!;
  private readonly refreshTokenSecret = process.env['REFRESH_TOKEN_SECRET']!;
  private readonly jwtExpiry = process.env['JWT_EXPIRY'] || '15m';
  private readonly refreshTokenExpiry = process.env['REFRESH_TOKEN_EXPIRY'] || '7d';

  async register(data: RegisterData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          full_name: data.fullName,
          phone: data.phone || null,
          country: data.country || null,
          email_verify_token: this.generateEmailToken(),
          email_verify_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          is_email_verified: true,
          kyc_level: true,
          created_at: true
        }
      });

      // TODO: Send verification email

      return {
        message: 'Registration successful. Please check your email for verification.',
        user
      };
    } catch (error: any) {
      if (process.env['NODE_ENV'] === 'development' && (error.code === 'P1001' || error.message?.includes('Can\'t reach database server'))) {
        console.warn('⚠️ Database unreachable. Returning mock success for registration.');
        return {
          message: 'Registration successful (MOCK). Database is currently offline.',
          user: {
            id: 'mock-id-' + Date.now(),
            email: data.email,
            full_name: data.fullName,
            is_email_verified: true,
            kyc_level: 'LEVEL_1',
            created_at: new Date()
          }
        };
      }
      throw error;
    }
  }

  async login(data: LoginData) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Check account status
      if (user.status !== 'ACTIVE') {
        throw createError('Account is not active', 401);
      }

      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        throw createError('Account is temporarily locked. Please try again later.', 423);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id);
        throw createError('Invalid email or password', 401);
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);

      // Generate tokens
      const tokens = await this.generateTokenPair(user.id);

      // Create session
      await this.createSession(user.id, tokens.refreshToken, data.rememberMe);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
      });

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: 900, // 15 minutes
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_2fa_enabled: user.is_2fa_enabled,
          kyc_level: user.kyc_level
        }
      };
    } catch (error: any) {
      // Fallback for development if DB is unreachable
      if (process.env['NODE_ENV'] === 'development' && (error.code === 'P1001' || error.message?.includes('Can\'t reach database server'))) {
        console.warn('⚠️ Database unreachable. Returning mock user for development.');
        const mockUserId = 'mock-user-id-' + data.email.split('@')[0];
        const tokens = await this.generateTokenPair(mockUserId);
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: 900,
          user: {
            id: mockUserId,
            email: data.email,
            full_name: 'Mock User (' + data.email.split('@')[0] + ')',
            is_2fa_enabled: false,
            kyc_level: 'LEVEL_1'
          }
        };
      }
      throw error;
    }
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      
      // Check if refresh token exists in Redis
      const storedUserId = await redisService.getSession(refreshToken);
      if (!storedUserId || storedUserId !== decoded.userId) {
        throw createError('Invalid refresh token', 401);
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw createError('Invalid user', 401);
      }

      // Generate new token pair
      const tokens = await this.generateTokenPair(user.id);

      // Rotate refresh token
      await this.rotateRefreshToken(user.id, refreshToken, tokens.refreshToken);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: 900
      };
    } catch (error) {
      throw createError('Invalid or expired refresh token', 401);
    }
  }

  async logout(refreshToken: string) {
    try {
      // Remove from Redis
      await redisService.deleteSession(refreshToken);
      
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      // Still return success even if Redis fails
      return { message: 'Logged out successfully' };
    }
  }

  async generate2FASecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `CryptoVault Pro (${userId})`,
      issuer: 'CryptoVault Pro'
    });

    // Save secret to user (temporarily, until verified)
    await prisma.user.update({
      where: { id: userId },
      data: { twofa_secret: secret.base32 }
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    };
  }

  async verify2FA(userId: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twofa_secret: true }
    });

    if (!user || !user.twofa_secret) {
      throw createError('2FA not set up', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps of tolerance
    });

    if (!verified) {
      throw createError('Invalid verification code', 400);
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { is_2fa_enabled: true }
    });

    return { message: '2FA enabled successfully' };
  }

  private async generateTokenPair(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.jwtExpiry } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  private async createSession(userId: string, refreshToken: string, rememberMe: boolean = false) {
    const ttl = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day
    await redisService.setSession(refreshToken, userId, ttl);
  }

  private async rotateRefreshToken(userId: string, oldToken: string, newToken: string) {
    // Remove old token
    await redisService.deleteSession(oldToken);
    
    // Store new token
    await this.createSession(userId, newToken, true);
  }

  private async handleFailedLogin(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failed_login_attempts: { increment: 1 },
        locked_until: {
          set: (await prisma.user.findUnique({ where: { id: userId } }))?.failed_login_attempts! >= 4 
            ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes after 5 failed attempts
            : undefined
        }
      }
    });

    // TODO: Send security alert email
  }

  private async resetFailedAttempts(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failed_login_attempts: 0,
        locked_until: null
      }
    });
  }

  private generateEmailToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default new AuthService();
