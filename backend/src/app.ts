import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import logger from './logger';

// Routes
import patientRoutes from './routes/patientRoutes';
import staffRoutes from './routes/staffRoutes';
import imageRoutes from './routes/imageRoutes';
import financialRoutes from './routes/financialRoutes';
import reportRoutes from './routes/reportRoutes';
import authRoutes from './routes/authRoutes';
import patientAuthRoutes from './routes/patientAuthRoutes';
import patientAppointmentRoutes from './routes/patientAppointmentRoutes';
import patientDataRoutes from './routes/patientDataRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import auditRoutes from './routes/auditRoutes';
import notificationRoutes from './routes/notificationRoutes';
import doctorRoutes from './routes/doctorRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import vitalRoutes from './routes/vitalRoutes';

// Jobs
import { startReminderJob } from './jobs/reminderJob';

// Middleware
import { authMiddleware } from './middleware/authMiddleware';
import { patientAuthMiddleware } from './middleware/patientAuthMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// 1. CORS
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const configuredOrigins = [
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
  ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // No origin = same-origin or non-browser request
    if (!origin) return callback(null, true);
    const allowed = LOCALHOST_ORIGIN.test(origin) || configuredOrigins.includes(origin);
    callback(allowed ? null : new Error('Not allowed by CORS'), allowed ? origin : false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-patient-id', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

// 2. Cookie parsing + JSON parsing
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Serve uploaded images — proxy from S3 in production, local disk in dev
if (process.env.AWS_S3_BUCKET) {
  const { getFromS3 } = require('./services/s3Service');
  app.get('/uploads/*', async (req: Request, res: Response) => {
    try {
      const key = req.path.replace(/^\/uploads\//, '');
      const { body, contentType } = await getFromS3(key);
      res.setHeader('Content-Type', contentType);
      body.pipe(res);
    } catch {
      res.status(404).json({ success: false, error: 'Image not found' });
    }
  });
} else {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// 4. Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 5. PUBLIC ROUTES (No Auth Required)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api/auth/login', authRateLimiter);
app.use('/api/patient-auth/login', authRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/patient-auth', patientAuthRoutes);

// 6a. PATIENT PORTAL ROUTES (Require x-patient-id)
app.use('/api/patient/appointments', patientAuthMiddleware, patientAppointmentRoutes);
app.use('/api/patient/data', patientAuthMiddleware, patientDataRoutes);

// 6b. PROTECTED ROUTES (Require x-staff-id)
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/staff', authMiddleware, staffRoutes);
app.use('/api/images', authMiddleware, imageRoutes);
app.use('/api/financial', authMiddleware, financialRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/doctors', authMiddleware, doctorRoutes);
app.use('/api/prescriptions', authMiddleware, prescriptionRoutes);
app.use('/api/vitals', authMiddleware, vitalRoutes);

// 7. Global error handler
app.use(errorHandler);

// 8. Serve built React frontend (production single-deployment)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// 9. SPA fallback — serve index.html for any non-API route (React Router)
app.use('*', (req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
  } else {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});

export default app;

// Only bind the port when this file is the entry point, not when imported by tests.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'MediSync HMS Backend started');
    startReminderJob();
  });
}