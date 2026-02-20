import { Router } from 'express';
import { createReport, getReports, getReportStats, getReportById, updateReport, deleteReport } from '../controllers/reportController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', upload.single('image'), createReport);
router.get('/', getReports);
router.get('/stats', getReportStats);
router.get('/:id', getReportById);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);

export default router;
