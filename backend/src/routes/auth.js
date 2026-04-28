import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { syncUser, getMe } from '../controllers/auth.js';

const router = Router();

// POST /auth/sync — upsert user into our users table after login
router.post('/sync', requireAuth, syncUser);

// GET /auth/me — return current user's profile
router.get('/me', requireAuth, getMe);

export default router;
