import { Router } from 'express';
import { createReport, getJobStatus, getReports, getReportStats, getReportById, updateReport, deleteReport, getNearbyReports, getGeoJSONReports, getAuthorityKPIs, proposeResolution, confirmResolution, rejectResolution, citizenConfirmResolution, citizenDisputeResolution, upvoteReport, getAuditLogs, getRetrainingQueue, updateFeedbackStatus, testAudioPrediction, bulkUpdateReports, askCivicAI, exportRetrainingData } from '../controllers/report/index.js';
import { upload } from '../middleware/upload.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';

const router = Router();

// Apply auth middleware to all report routes
router.use(verifySupabaseToken);

router.post('/', requirePermission('report:create'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createReport);
router.post('/test-audio', requirePermission('report:create'), upload.single('audio'), testAudioPrediction);

router.get('/geojson', requirePermission('report:view_area'), getGeoJSONReports);
router.get('/kpi', requirePermission('report:view_all'), getAuthorityKPIs);
router.get('/', getReports);
router.patch('/bulk-update', requirePermission('report:bulk_update'), bulkUpdateReports);
router.get('/nearby', requirePermission('report:view_area'), getNearbyReports);
router.get('/stats', getReportStats);
router.get('/ask', requirePermission('report:view_all'), askCivicAI);
router.get('/retraining-queue/export', requirePermission('ai:manage'), exportRetrainingData);
router.get('/retraining-queue', requirePermission('ai:manage'), getRetrainingQueue);
router.post('/:id/propose-resolution', requirePermission('report:propose_resolution'), upload.single('image'), proposeResolution);
router.post('/:id/confirm-resolution', requirePermission('report:confirm_resolution'), confirmResolution);
router.post('/:id/citizen-confirm', requirePermission('report:confirm_resolution'), citizenConfirmResolution);
router.post('/:id/citizen-dispute', requirePermission('report:reject_resolution'), citizenDisputeResolution);
router.post('/:id/reject-resolution', requirePermission('report:reject_resolution'), rejectResolution);
router.post('/:id/upvote', requirePermission('report:upvote'), upvoteReport);
router.patch('/retraining-queue/:id', requirePermission('ai:manage'), updateFeedbackStatus);
router.get('/:id/audit', getAuditLogs);
router.get('/status/:job_id', getJobStatus);
router.get('/:id', getReportById);
router.patch('/:id', requirePermission('report:update_status'), updateReport);
router.delete('/:id', requirePermission('report:delete'), deleteReport);

export default router;
