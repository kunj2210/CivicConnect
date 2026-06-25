import { Router } from 'express';
import { queryExecutiveAnalytics, reindexVectorDatabase } from '../controllers/analyticsController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';

const router = Router();

// All analytics routes require authentication
router.use(verifySupabaseToken);

router.post('/query', requirePermission('analytics:query'), queryExecutiveAnalytics);
router.post('/reindex', requirePermission('ai:manage'), reindexVectorDatabase);

export default router;
