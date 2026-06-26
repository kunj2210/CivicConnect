import { Router } from 'express';
import { getWards, createWard, getUlbs, createUlb, wipeData } from '../controllers/systemController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';

const router = Router();

// Apply auth verification to all routes
router.use(verifySupabaseToken);

// Wards management
router.get('/wards', getWards);
router.post('/wards', requirePermission('users:manage'), createWard);

// ULB Boundaries management
router.get('/ulb-boundaries', getUlbs);
router.post('/ulb-boundaries', requirePermission('users:manage'), createUlb);

// Database wipe
router.post('/wipe-data', requirePermission('users:manage'), wipeData);

export default router;
