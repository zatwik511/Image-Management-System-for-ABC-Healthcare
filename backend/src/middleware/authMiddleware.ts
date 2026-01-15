import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      staffID?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const staffID = req.headers['x-staff-id'] as string;

  if (!staffID) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Staff ID required',
    });
  }

  req.staffID = staffID;
  next();
};
