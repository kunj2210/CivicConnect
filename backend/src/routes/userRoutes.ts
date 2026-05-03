import { Router } from 'express';
import { getAllUsers, getStaff, getMyProfile, updateUserProfile, getLeaderboard, updateDeviceToken } from '../controllers/userController.js';

import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// All user routes require authentication
// duplicate route eliminated
router.get('/', verifySupabaseToken, getAllUsers);
router.get('/me', verifySupabaseToken, getMyProfile);
router.patch('/:id', verifySupabaseToken, updateUserProfile);
router.get('/staff', verifySupabaseToken, getStaff);
router.get('/leaderboard', verifySupabaseToken, getLeaderboard);
router.post('/device-token', verifySupabaseToken, updateDeviceToken);


export default router;
