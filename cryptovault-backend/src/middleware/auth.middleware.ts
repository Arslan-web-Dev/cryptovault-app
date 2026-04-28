import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    kycLevel: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user from database
      const user = await prisma.user.findUnique({
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
    } catch (jwtError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

export const requireKycLevel = (minLevel: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const kycLevels = { 'LEVEL_0': 0, 'LEVEL_1': 1, 'LEVEL_2': 2 };
    const userLevel = kycLevels[req.user.kycLevel as keyof typeof kycLevels] || 0;
    const requiredLevel = kycLevels[minLevel as keyof typeof kycLevels] || 0;

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
