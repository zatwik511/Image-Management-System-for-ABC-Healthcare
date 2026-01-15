// backend/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database/supabaseClient';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { name, id } = req.body;

  try {
    let query = supabase.from('staff').select('*');
    
    // Login by ID or Name
    if (id) {
      query = query.eq('id', id);
    } else if (name) {
      query = query.eq('name', name);
    } else {
      return res.status(400).json({ success: false, error: 'Name or ID required' });
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Success! Return the staff details
    return res.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        role: data.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
