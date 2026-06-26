import type { Request, Response } from 'express';
import { User, Department, Ward, Issue, Repair, AuditLog, Notification, AIFeedback, UserDevice, UserRole, UlbBoundary, sequelize } from '../config/db.js';
import { supabaseAdmin } from '../config/supabase.js';
import { Op } from 'sequelize';

export interface AuthRequest extends Request {
    user?: any;
}

/**
 * Fetch all Wards, scoped by user's city (ulb_id) if they are a local administrator.
 */
export const getWards = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const where: any = {};

        // If local City Admin or Mayor, scope to their city
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

/**
 * Create a new Ward. Automatically bounds it to the admin's city if they are a local admin.
 */
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

        // Format to GeoJSON Polygon: [[[lng, lat], [lng, lat], ..., [lng, lat]]]
        const formattedCoordinates = boundaryCoordinates.map((p: [number, number]) => [p[1], p[0]]); // Swap from [lat, lng] to [lng, lat]
        
        // Close the ring if not already closed
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

/**
 * Fetch all ULB boundaries.
 */
export const getUlbs = async (req: AuthRequest, res: Response) => {
    try {
        const ulbs = await UlbBoundary.findAll({
            order: [['name', 'ASC']]
        });
        res.json(ulbs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new ULB boundary. Only Super Admins can call this.
 */
export const createUlb = async (req: AuthRequest, res: Response) => {
    try {
        const { name, boundaryCoordinates } = req.body;

        if (!name || !boundaryCoordinates || boundaryCoordinates.length < 3) {
            return res.status(400).json({ error: 'Name and at least 3 boundary vertices are required.' });
        }

        // Format to GeoJSON Polygon: [[[lng, lat], [lng, lat], ..., [lng, lat]]]
        const formattedCoordinates = boundaryCoordinates.map((p: [number, number]) => [p[1], p[0]]);
        
        // Close the ring if not already closed
        const first = formattedCoordinates[0];
        const last = formattedCoordinates[formattedCoordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            formattedCoordinates.push([first[0], first[1]]);
        }

        const ulb = await UlbBoundary.create({
            name,
            geom: {
                type: 'MultiPolygon',
                coordinates: [[formattedCoordinates]]
            }
        });

        res.status(201).json(ulb);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Wipe out the entire database (destructive). Preserves only admin users.
 * Deletes all matching users from Supabase Auth.
 */
export const wipeData = async (req: AuthRequest, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        console.log('🔥 Initiating Full Database Wipe...');
        const actor = req.user;

        // 1. Find all non-admin users to delete from Supabase Auth
        const nonAdmins = await User.findAll({
            where: {
                role: { [Op.notIn]: ['admin', 'super_admin'] }
            },
            attributes: ['id', 'email']
        });

        console.log(`Removing ${nonAdmins.length} users from Supabase Auth...`);
        for (const u of nonAdmins) {
            try {
                await supabaseAdmin.auth.admin.deleteUser(u.id);
                console.log(`Deleted Supabase user: ${u.email}`);
            } catch (err: any) {
                console.warn(`Failed to delete Supabase user ${u.email}:`, err.message);
            }
        }

        // 2. Clear FK dependencies on remaining Admins
        await User.update({
            ward_id: null,
            department_id: null,
            ulb_id: null
        }, {
            where: {},
            transaction
        });

        // 3. Clear database tables in strict sequential order
        await Repair.destroy({ where: {}, transaction });
        await ProcessingJob.destroy({ where: {}, transaction });
        await AIFeedback.destroy({ where: {}, transaction });
        await Notification.destroy({ where: {}, transaction });
        await Issue.destroy({ where: {}, transaction });
        await UserDevice.destroy({ where: {}, transaction });

        // Unlink roles for non-admin users
        await UserRole.destroy({
            where: {
                user_id: { [Op.in]: nonAdmins.map(u => u.id) }
            },
            transaction
        });

        // Delete non-admin users
        await User.destroy({
            where: {
                role: { [Op.notIn]: ['admin', 'super_admin'] }
            },
            transaction
        });

        // Delete Wards, Departments, and ULB boundaries
        await Ward.destroy({ where: {}, transaction });
        await Department.destroy({ where: {}, transaction });
        await UlbBoundary.destroy({ where: {}, transaction });

        // Wipe Audit Logs
        await AuditLog.destroy({ where: {}, transaction });

        await transaction.commit();
        console.log('✔ Full Database Wipe Complete.');

        // Write a fresh audit log entry to record the wipe event
        await AuditLog.create({
            actor_id: actor?.id || 'SYSTEM',
            event_type: 'system.database_wipe',
            target_resource: 'database',
            payload: {
                message: 'All system transaction data, departments, wards, ULBs, and non-admin users were wiped.',
                actor_email: actor?.email || 'Unknown'
            }
        });

        res.json({ success: true, message: 'Database wiped successfully.' });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Wipe failed:', error);
        res.status(500).json({ error: error.message });
    }
};
