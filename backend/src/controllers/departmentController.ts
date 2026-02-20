import type { Request, Response } from 'express';
import { Department } from '../models/Department.js';

export const getDepartments = async (_req: Request, res: Response) => {
    try {
        const depts = await Department.findAll();
        res.json(depts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createDepartment = async (req: Request, res: Response) => {
    try {
        const { name, head, staff_count, status } = req.body;
        const dept = await Department.create({ name, head, staff_count, status });
        res.status(201).json(dept);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, head, staff_count, status } = req.body;
        const dept = await Department.findByPk(id as any);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        if (name) dept.name = name;
        if (head) dept.head = head;
        if (staff_count !== undefined) dept.staff_count = staff_count;
        if (status) dept.status = status;

        await dept.save();
        res.json(dept);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Department.destroy({ where: { id } });
        if (deleted === 0) return res.status(404).json({ error: 'Department not found' });
        res.json({ success: true, message: 'Department deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
