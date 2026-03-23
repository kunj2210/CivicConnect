import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentById } from '../controllers/departmentController.js';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifySupabaseToken);


router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.patch('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
