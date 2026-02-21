import express from 'express';
import { login, register, updateProfile, updatePassword } from '../controllers/authController.js';
const router = express.Router();
router.post('/login', login);
router.post('/register', register);
router.patch('/update-profile/:id', updateProfile);
router.patch('/update-password/:id', updatePassword);
export default router;
//# sourceMappingURL=authRoutes.js.map