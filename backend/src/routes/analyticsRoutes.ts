import { Router } from 'express';
import { queryExecutiveAnalytics, reindexVectorDatabase } from '../controllers/analyticsController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// All analytics routes require authentication
router.use(verifySupabaseToken);

router.post('/query', queryExecutiveAnalytics);
router.post('/reindex', reindexVectorDatabase);

export default router;
