import { Router } from 'express';
import { createReport, getReports, getReportStats, getReportById, updateReport, deleteReport, getNearbyReports, getGeoJSONReports, getAuthorityKPIs, proposeResolution, confirmResolution, upvoteReport } from '../controllers/reportController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('image'), createReport);
router.get('/geojson', getGeoJSONReports);
router.get('/kpi', getAuthorityKPIs);
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.get('/stats', getReportStats);
router.post('/:id/propose-resolution', upload.single('image'), proposeResolution);
router.post('/:id/confirm-resolution', confirmResolution);
router.post('/:id/upvote', upvoteReport);
router.get('/:id', getReportById);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;
