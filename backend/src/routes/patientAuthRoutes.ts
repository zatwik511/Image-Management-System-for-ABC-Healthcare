import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { patientAuthService, AccountLockedError } from '../services/PatientAuthService';
import { signPatientToken } from '../middleware/authMiddleware';
import logger from '../logger';

const router = Router();

patientAuthService.ensureColumns().catch(err => logger.error({ err }, 'patientAuthRoutes: ensureColumns failed'));

// POST /api/patient-auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ success: false, error: 'Email and PIN are required' });
  }

  if (name && name.trim().length > 255) {
    return res.status(400).json({ success: false, error: 'Name must be 255 characters or fewer' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  const patient = await patientAuthService.register((name || '').trim(), email.trim(), pin);
  const token = signPatientToken(patient.id);
  return res.status(201).json({ success: true, data: { token, ...patient } });
}));

// POST /api/patient-auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ success: false, error: 'Email and PIN are required' });
  }

  try {
    const patient = await patientAuthService.login(email.trim(), pin);
    if (!patient) {
      return res.status(401).json({ success: false, error: 'Invalid email or PIN' });
    }
    const token = signPatientToken(patient.id);
    return res.json({ success: true, data: { token, ...patient } });
  } catch (err: unknown) {
    if (err instanceof AccountLockedError) {
      return res.status(429).json({ success: false, error: err.message });
    }
    throw err;
  }
}));

export default router;
