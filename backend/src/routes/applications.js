import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listApplications, listStats, getApplication, editApplication, addApplication, removeApplication } from '../controllers/applications.js';

const router = Router();

router.get('/stats', requireAuth, listStats);
router.get('/', requireAuth, listApplications);
router.post('/', requireAuth, addApplication);
router.get('/:id', requireAuth, getApplication);
router.patch('/:id', requireAuth, editApplication);
router.delete('/:id', requireAuth, removeApplication);

export default router;
