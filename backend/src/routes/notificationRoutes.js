import { Router } from 'express';
import { getNotifications, createNotification, markAsRead } from '../controllers/notificationController.js';
import { registerFcmToken } from '../controllers/reportController.js';
const router = Router();
router.get('/', getNotifications);
router.post('/', createNotification);
router.post('/register-fcm', registerFcmToken);
router.patch('/:id/read', markAsRead);
export default router;
//# sourceMappingURL=notificationRoutes.js.map