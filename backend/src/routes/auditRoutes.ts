import { Router } from 'express';
import { verifySupabaseToken } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { AuditLog } from '../models/AuditLog.js';
import { Op } from 'sequelize';

const router = Router();

router.use(verifySupabaseToken);

/**
 * GET /api/audit-logs
 * Query params:
 *   resource        - filter by target_resource (e.g. 'issue', 'user')
 *   resource_id     - filter by target_resource_id (specific entity UUID)
 *   actor_id        - filter by the user who performed the action
 *   event_type      - filter by event type string
 *   from            - ISO date string (start range)
 *   to              - ISO date string (end range)
 *   limit           - max records (default 100)
 */
router.get('/', requirePermission('audit:view'), async (req: any, res: any) => {
    try {
        const { resource, resource_id, actor_id, event_type, from, to, limit = '100' } = req.query;

        const where: any = {};

        if (resource) where.target_resource = resource;
        if (resource_id) where.target_resource_id = resource_id;
        if (actor_id) where.actor_id = actor_id;
        if (event_type) where.event_type = event_type;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from as string);
            if (to) where.createdAt[Op.lte] = new Date(to as string);
        }

        const logs = await AuditLog.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Math.min(parseInt(limit as string, 10), 500),
        });

        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
