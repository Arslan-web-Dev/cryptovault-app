"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireKycLevel = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from database
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    kyc_level: true,
                    status: true
                }
            });
            if (!user || user.status !== 'ACTIVE') {
                res.status(401).json({ error: 'Invalid or inactive user' });
                return;
            }
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                kycLevel: user.kyc_level
            };
            next();
        }
        catch (jwtError) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireKycLevel = (minLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const kycLevels = { 'LEVEL_0': 0, 'LEVEL_1': 1, 'LEVEL_2': 2 };
        const userLevel = kycLevels[req.user.kycLevel] || 0;
        const requiredLevel = kycLevels[minLevel] || 0;
        if (userLevel < requiredLevel) {
            res.status(403).json({
                error: 'KYC level required',
                required: minLevel,
                current: req.user.kycLevel
            });
            return;
        }
        next();
    };
};
exports.requireKycLevel = requireKycLevel;
//# sourceMappingURL=auth.middleware.js.map