import type { Response } from 'express';
import { AuditLog } from '../../config/db.js';
import type { AuthRequest } from './report.utils.js';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const logs = await AuditLog.findAll({
            where: { payload: { issue_id: id } },
            order: [['createdAt', 'DESC']],
        });

        res.json(logs);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
