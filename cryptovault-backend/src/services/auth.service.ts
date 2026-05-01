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
  role: 'USER' | 'ADMIN';
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

      // Admin auto-approval for specific email
      const isAutoApproved = data.email === 'arslan.admain@gmail.com';

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
          full_name: data.fullName,
          phone: data.phone || null,
          country: data.country || null,
          role: data.role as any,
          is_approved: isAutoApproved,
          email_verify_token: this.generateEmailToken(),
          email_verify_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          is_approved: true,
          created_at: true
        }
      });

      return {
        message: isAutoApproved 
          ? 'Admin account created and auto-approved.' 
          : 'Registration successful. Waiting for admin approval.',
        user
      };
    } catch (error: any) {
      if (process.env['NODE_ENV'] === 'development' && (error.code === 'P1001' || error.message?.includes('Can\'t reach database server'))) {
        console.warn('⚠️ Database unreachable. Returning mock success for registration.');
        return {
          message: 'Registration successful (MOCK). Waiting for admin approval.',
          user: {
            id: 'mock-id-' + Date.now(),
            email: data.email,
            full_name: data.fullName,
            role: data.role,
            is_approved: data.email === 'arslan.admain@gmail.com',
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

      // Check approval status (Requirement 2)
      if (!user.is_approved && user.email !== 'arslan.admain@gmail.com') {
        throw createError('Your account is pending admin approval.', 403);
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
        expires_in: 900,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_approved: user.is_approved,
          is_2fa_enabled: user.is_2fa_enabled,
          kyc_level: user.kyc_level
        }
      };
    } catch (error: any) {
      if (process.env['NODE_ENV'] === 'development' && (error.code === 'P1001' || error.message?.includes('Can\'t reach database server'))) {
        // Special case for the admin credentials provided by the user
        if (data.email === 'arslan.admain@gmail.com' && data.password === 'Cui@59191') {
          console.warn('⚠️ Database unreachable. Returning mock Admin session.');
          const tokens = await this.generateTokenPair('admin-id-primary');
          return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expires_in: 900,
            user: {
              id: 'admin-id-primary',
              email: data.email,
              full_name: 'Arslan Admin',
              role: 'ADMIN',
              is_approved: true,
              is_2fa_enabled: false,
              kyc_level: 'LEVEL_2'
            }
          };
        }

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
            role: 'USER',
            is_approved: false, // Normal users need approval
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
      const storedUserId = await redisService.getSession(refreshToken);
      if (!storedUserId || storedUserId !== decoded.userId) {
        throw createError('Invalid refresh token', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true, is_approved: true }
      });

      if (!user || (user.status !== 'ACTIVE' && !user.is_approved)) {
        throw createError('Invalid user or pending approval', 401);
      }

      const tokens = await this.generateTokenPair(user.id);
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
      await redisService.deleteSession(refreshToken);
      return { message: 'Logged out successfully' };
    } catch (error) {
      return { message: 'Logged out successfully' };
    }
  }

  async generate2FASecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `CryptoVault Pro (${userId})`,
      issuer: 'CryptoVault Pro'
    });

    await prisma.user.update({
      where: { id: userId },
      data: { twofa_secret: secret.base32 }
    });

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
      window: 2
    });

    if (!verified) {
      throw createError('Invalid verification code', 400);
    }

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
    const ttl = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
    await redisService.setSession(refreshToken, userId, ttl);
  }

  private async rotateRefreshToken(userId: string, oldToken: string, newToken: string) {
    await redisService.deleteSession(oldToken);
    await this.createSession(userId, newToken, true);
  }

  private async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failed_login_attempts: { increment: 1 },
        locked_until: user.failed_login_attempts >= 4 
          ? new Date(Date.now() + 15 * 60 * 1000)
          : undefined
      }
    });
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
