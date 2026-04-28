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
declare class AuthService {
    private readonly jwtSecret;
    private readonly refreshTokenSecret;
    private readonly jwtExpiry;
    private readonly refreshTokenExpiry;
    register(data: RegisterData): Promise<{
        message: string;
        user: {
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            email: string;
            password_hash: string;
            full_name: string;
            phone: string | null;
            country: string | null;
            timezone: string;
            is_email_verified: boolean;
            email_verify_token: string | null;
            email_verify_expires: Date | null;
            is_2fa_enabled: boolean;
            twofa_secret: string | null;
            twofa_backup_codes: string[];
            kyc_level: import(".prisma/client").$Enums.KycLevel;
            role: import(".prisma/client").$Enums.UserRole;
            last_login: Date | null;
            failed_login_attempts: number;
            locked_until: Date | null;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    login(data: LoginData): Promise<{
        access_token: never;
        refresh_token: never;
        expires_in: number;
        user: {
            id: string;
            email: string;
            full_name: string;
            is_2fa_enabled: boolean;
            kyc_level: import(".prisma/client").$Enums.KycLevel;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: never;
        refresh_token: never;
        expires_in: number;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    generate2FASecret(userId: string): Promise<{
        secret: any;
        qrCode: string;
        manualEntryKey: any;
    }>;
    verify2FA(userId: string, token: string): Promise<{
        message: string;
    }>;
    private generateTokenPair;
    private createSession;
    private rotateRefreshToken;
    private handleFailedLogin;
    private resetFailedAttempts;
    private generateEmailToken;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map