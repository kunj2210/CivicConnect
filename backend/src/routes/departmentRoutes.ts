import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getDepartmentById } from '../controllers/departmentController.js';

const router = Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.patch('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
