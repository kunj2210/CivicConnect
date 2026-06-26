import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentById } from '../controllers/departmentController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';

const router = Router();

router.use(verifySupabaseToken);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requirePermission('users:manage'), createDepartment);
router.patch('/:id', requirePermission('users:manage'), updateDepartment);
router.delete('/:id', requirePermission('users:manage'), deleteDepartment);

export default router;
