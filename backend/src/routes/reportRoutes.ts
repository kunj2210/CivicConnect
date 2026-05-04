import { Router } from 'express';
import { createReport, getReports, getReportStats, getReportById, updateReport, deleteReport, getNearbyReports, getGeoJSONReports, getAuthorityKPIs, proposeResolution, confirmResolution, rejectResolution, citizenConfirmResolution, citizenDisputeResolution, upvoteReport, getAuditLogs, getRetrainingQueue, updateFeedbackStatus, testAudioPrediction, bulkUpdateReports, askCivicAI, exportRetrainingData } from '../controllers/reportController.js';
import { upload } from '../middleware/upload.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth middleware to all report routes
router.use(verifySupabaseToken);

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createReport);
router.post('/test-audio', upload.single('audio'), testAudioPrediction);

router.get('/geojson', getGeoJSONReports);
router.get('/kpi', getAuthorityKPIs);
router.get('/', getReports);
router.patch('/bulk-update', bulkUpdateReports);
router.get('/nearby', getNearbyReports);
router.get('/stats', getReportStats);
router.get('/ask', askCivicAI);
router.get('/retraining-queue/export', exportRetrainingData);
router.get('/retraining-queue', getRetrainingQueue);
router.post('/:id/propose-resolution', upload.single('image'), proposeResolution);
router.post('/:id/confirm-resolution', confirmResolution);
router.post('/:id/citizen-confirm', citizenConfirmResolution);
router.post('/:id/citizen-dispute', citizenDisputeResolution);
router.post('/:id/reject-resolution', rejectResolution);
router.post('/:id/upvote', upvoteReport);
router.patch('/retraining-queue/:id', updateFeedbackStatus);
router.get('/:id/audit', getAuditLogs);
router.get('/:id', getReportById);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;
