import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { scrape } from '../controllers/scraper.js';

const router = Router();

router.post('/', requireAuth, scrape);

export default router;
