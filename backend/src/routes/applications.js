import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addApplication } from '../controllers/applications.js';

const router = Router();

// POST /applications — create a new application
router.post('/', requireAuth, addApplication);

export default router;
