import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listApplications, addApplication } from '../controllers/applications.js';

const router = Router();

router.get('/', requireAuth, listApplications);
router.post('/', requireAuth, addApplication);

export default router;
