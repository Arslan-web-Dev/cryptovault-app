"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const redis_1 = __importDefault(require("../config/redis"));
const error_middleware_1 = require("../middleware/error.middleware");
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET;
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        this.jwtExpiry = process.env.JWT_EXPIRY || '15m';
        this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    }
    async register(data) {
        // Check if user already exists
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw (0, error_middleware_1.createError)('User with this email already exists', 409);
        }
        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const passwordHash = await bcrypt_1.default.hash(data.password, saltRounds);
        // Create user
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                password_hash: passwordHash,
                full_name: data.fullName,
                phone: data.phone,
                country: data.country,
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
    }
    async login(data) {
        // Find user
        const user = await database_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (!user) {
            throw (0, error_middleware_1.createError)('Invalid email or password', 401);
        }
        // Check account status
        if (user.status !== 'ACTIVE') {
            throw (0, error_middleware_1.createError)('Account is not active', 401);
        }
        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            throw (0, error_middleware_1.createError)('Account is temporarily locked. Please try again later.', 423);
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isPasswordValid) {
            await this.handleFailedLogin(user.id);
            throw (0, error_middleware_1.createError)('Invalid email or password', 401);
        }
        // Reset failed attempts on successful login
        await this.resetFailedAttempts(user.id);
        // Generate tokens
        const tokens = await this.generateTokenPair(user.id);
        // Create session
        await this.createSession(user.id, tokens.refreshToken, data.rememberMe);
        // Update last login
        await database_1.prisma.user.update({
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
    }
    async refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.refreshTokenSecret);
            // Check if refresh token exists in Redis
            const storedUserId = await redis_1.default.getSession(refreshToken);
            if (!storedUserId || storedUserId !== decoded.userId) {
                throw (0, error_middleware_1.createError)('Invalid refresh token', 401);
            }
            // Get user
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, status: true }
            });
            if (!user || user.status !== 'ACTIVE') {
                throw (0, error_middleware_1.createError)('Invalid user', 401);
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
        }
        catch (error) {
            throw (0, error_middleware_1.createError)('Invalid or expired refresh token', 401);
        }
    }
    async logout(refreshToken) {
        try {
            // Remove from Redis
            await redis_1.default.deleteSession(refreshToken);
            return { message: 'Logged out successfully' };
        }
        catch (error) {
            console.error('Logout error:', error);
            // Still return success even if Redis fails
            return { message: 'Logged out successfully' };
        }
    }
    async generate2FASecret(userId) {
        const secret = speakeasy_1.default.generateSecret({
            name: `CryptoVault Pro (${userId})`,
            issuer: 'CryptoVault Pro'
        });
        // Save secret to user (temporarily, until verified)
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { twofa_secret: secret.base32 }
        });
        // Generate QR code
        const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
        return {
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntryKey: secret.base32
        };
    }
    async verify2FA(userId, token) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { twofa_secret: true }
        });
        if (!user || !user.twofa_secret) {
            throw (0, error_middleware_1.createError)('2FA not set up', 400);
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps of tolerance
        });
        if (!verified) {
            throw (0, error_middleware_1.createError)('Invalid verification code', 400);
        }
        // Enable 2FA
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { is_2fa_enabled: true }
        });
        return { message: '2FA enabled successfully' };
    }
    async generateTokenPair(userId) {
        const accessToken = jsonwebtoken_1.default.sign({ userId }, this.jwtSecret, { expiresIn: this.jwtExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry });
        return { accessToken, refreshToken };
    }
    async createSession(userId, refreshToken, rememberMe = false) {
        const ttl = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day
        await redis_1.default.setSession(refreshToken, userId, ttl);
    }
    async rotateRefreshToken(userId, oldToken, newToken) {
        // Remove old token
        await redis_1.default.deleteSession(oldToken);
        // Store new token
        await this.createSession(userId, newToken, true);
    }
    async handleFailedLogin(userId) {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                failed_login_attempts: { increment: 1 },
                locked_until: {
                    set: (await database_1.prisma.user.findUnique({ where: { id: userId } }))?.failed_login_attempts >= 4
                        ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes after 5 failed attempts
                        : undefined
                }
            }
        });
        // TODO: Send security alert email
    }
    async resetFailedAttempts(userId) {
        await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                failed_login_attempts: 0,
                locked_until: null
            }
        });
    }
    generateEmailToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map