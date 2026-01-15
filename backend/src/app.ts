import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// Routes
import patientRoutes from './routes/patientRoutes';
import staffRoutes from './routes/staffRoutes';
import imageRoutes from './routes/imageRoutes';
import financialRoutes from './routes/financialRoutes';
import reportRoutes from './routes/reportRoutes';
import authRoutes from './routes/authRoutes'; // ✅ NEW: Import Auth Routes

// Middleware
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// 🚀 1. CORS - Configured for Frontend
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Backend itself
    'http://127.0.0.1:5173' // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'x-staff-id',
    'Authorization',
    'Accept'
  ],
  optionsSuccessStatus: 200
}));

// 2. JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🖼️ 3. Serve static files from uploads folder (for image viewing)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('📁 Static files served from:', path.join(__dirname, '../uploads'));

// 4. Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🚀 5. PUBLIC ROUTES (No Auth Required) ✅
app.use('/api/auth', authRoutes); // Login route lives here

// 🔒 6. PROTECTED ROUTES (Require x-staff-id) ✅
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/staff', authMiddleware, staffRoutes);
app.use('/api/images', authMiddleware, imageRoutes);
app.use('/api/financial', authMiddleware, financialRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// 7. Global error handler (LAST middleware)
app.use(errorHandler);

// 8. 404 handler for unmatched routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 IMS Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Auth Service: http://localhost:${PORT}/api/auth/login`);
  console.log(`🖼️  Image uploads accessible at: http://localhost:${PORT}/uploads`);
});

export default app;
