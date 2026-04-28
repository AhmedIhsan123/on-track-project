import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listApplications, listStats, getApplication, editApplication, addApplication } from '../controllers/applications.js';

const router = Router();

router.get('/stats', requireAuth, listStats);
router.get('/', requireAuth, listApplications);
router.post('/', requireAuth, addApplication);
router.get('/:id', requireAuth, getApplication);
router.patch('/:id', requireAuth, editApplication);

export default router;
