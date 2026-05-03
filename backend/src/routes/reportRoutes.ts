import { Router } from 'express';
import { createReport, getReports, getReportStats, getReportById, updateReport, deleteReport, getNearbyReports, getGeoJSONReports, getAuthorityKPIs, proposeResolution, confirmResolution, rejectResolution, upvoteReport, getAuditLogs, getRetrainingQueue, updateFeedbackStatus } from '../controllers/reportController.js';
import { upload } from '../middleware/upload.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all report routes
router.use(verifySupabaseToken);

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createReport);

router.get('/geojson', getGeoJSONReports);
router.get('/kpi', getAuthorityKPIs);
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.get('/stats', getReportStats);
router.get('/retraining-queue', getRetrainingQueue);
router.post('/:id/propose-resolution', upload.single('image'), proposeResolution);
router.post('/:id/confirm-resolution', confirmResolution);
router.post('/:id/reject-resolution', rejectResolution);
router.post('/:id/upvote', upvoteReport);
router.patch('/retraining-queue/:id', updateFeedbackStatus);
router.get('/:id/audit', getAuditLogs);
router.get('/:id', getReportById);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;
