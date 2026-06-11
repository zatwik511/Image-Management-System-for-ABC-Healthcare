import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './authMiddleware';

declare global {
  namespace Express {
    interface Request {
      patientID?: string;
    }
  }
}

export const patientAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Patient authentication required',
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { patientId: string; type?: string };
    if (payload.type !== 'patient') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session' });
    }
    req.patientID = payload.patientId;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired session' });
  }
};
