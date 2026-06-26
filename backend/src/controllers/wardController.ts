import type { Request, Response } from 'express';
import { Ward, Department, UlbBoundary } from '../config/db.js';

export interface AuthRequest extends Request {
    user?: any;
}

export const getWards = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const where: any = {};

        if (user && user.role !== 'super_admin' && user.ulb_id) {
            where.ulb_id = user.ulb_id;
        }

        const wards = await Ward.findAll({
            where,
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: UlbBoundary, as: 'ulb', attributes: ['id', 'name'] }
            ],
            order: [['name', 'ASC']]
        });
        res.json(wards);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createWard = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const { name, dept_id, boundaryCoordinates } = req.body;
        let ulb_id = req.body.ulb_id;

        if (user && user.role !== 'super_admin') {
            ulb_id = user.ulb_id;
        }

        if (!name || !dept_id || !boundaryCoordinates || boundaryCoordinates.length < 3) {
            return res.status(400).json({ error: 'Name, dept_id, and at least 3 boundary vertices are required.' });
        }

        const formattedCoordinates = boundaryCoordinates.map((p: [number, number]) => [p[1], p[0]]);
        
        const first = formattedCoordinates[0];
        const last = formattedCoordinates[formattedCoordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            formattedCoordinates.push([first[0], first[1]]);
        }

        const ward = await Ward.create({
            name,
            dept_id,
            ulb_id: ulb_id || null,
            boundary: {
                type: 'Polygon',
                coordinates: [formattedCoordinates]
            }
        });

        res.status(201).json(ward);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
