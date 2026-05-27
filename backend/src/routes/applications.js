import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listApplications, listStats, getApplication, editApplication, addApplication, removeApplication, createApplicationFromUrl } from '../controllers/applications.js';

const router = Router();

router.get('/stats', requireAuth, listStats);
router.get('/', requireAuth, listApplications);
router.post('/', requireAuth, addApplication);
router.post('/from-url', requireAuth, createApplicationFromUrl);
router.get('/:id', requireAuth, getApplication);
router.patch('/:id', requireAuth, editApplication);
router.delete('/:id', requireAuth, removeApplication);

export default router;
