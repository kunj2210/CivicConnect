import { Router } from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifySupabaseToken);

router.get('/', getNotifications);
router.post('/', createNotification);
router.patch('/:id/read', markAsRead);



export default router;
