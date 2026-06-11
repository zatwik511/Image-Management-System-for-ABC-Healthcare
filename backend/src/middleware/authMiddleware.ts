import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      staffID?: string;
      staffRole?: string;
    }
  }
}

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    'JWT_SECRET environment variable must be set and at least 32 characters long'
  );
}
export const JWT_SECRET: string = secret;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No session token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { staffId: string; role: string; type?: string };
    if (payload.type !== 'staff') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session' });
    }
    req.staffID = payload.staffId;
    req.staffRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session' });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.staffRole || !roles.includes(req.staffRole)) {
      return res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
    }
    next();
  };

export const signToken = (staffId: string, role: string): string =>
  jwt.sign({ staffId, role, type: 'staff' }, JWT_SECRET, { expiresIn: '8h' });

export const signPatientToken = (patientId: string): string =>
  jwt.sign({ patientId, type: 'patient' }, JWT_SECRET, { expiresIn: '8h' });
