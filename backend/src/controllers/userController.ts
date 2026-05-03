import type { Request, Response } from 'express';
import { User, Department, Ward, UserDevice } from '../config/db.js';
import { findWardId } from '../utils/spatialUtils.js';
import { GamificationService } from '../services/gamificationService.js';
import { Op } from 'sequelize';



export interface AuthRequest extends Request {
    userIdentifier?: string;
    user?: any;
}


/**
 * Retrieves all registered users for global administrative management.
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.findAll({
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Ward, as: 'ward', attributes: ['id', 'name'] }
            ]
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Controller for managing municipal staff and administrative users.
 */
export const getStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { ward_id, department_id } = req.query;
        const where: any = { role: 'staff' };

        if (ward_id) where.ward_id = ward_id;
        if (department_id) where.department_id = department_id;

        const staff = await User.findAll({
            where,
            include: [
                { model: Department, as: 'department', attributes: ['id', 'name'] },
                { model: Ward, as: 'ward', attributes: ['id', 'name'] }
            ]
        });

        res.json(staff);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Updates a user's role or jurisdiction (Super Admin only).
 */
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role, ward_id, department_id, is_active, home_location, alert_radius_meters } = req.body;

        const user = await User.findByPk(id as string);

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (role) user.role = role;
        if (ward_id) user.ward_id = ward_id;
        if (department_id) user.department_id = department_id;
        if (is_active !== undefined) user.is_active = is_active;
        if (home_location) {
            const lon = parseFloat(home_location.lon);
            const lat = parseFloat(home_location.lat);
            user.home_location = {
                type: 'Point',
                coordinates: [lon, lat]
            };

            // Automatically sync ward_id based on home_location
            const calculatedWardId = await findWardId(lon, lat);
            if (calculatedWardId) {
                user.ward_id = calculatedWardId;
            }
        }

        if (alert_radius_meters) user.alert_radius_meters = alert_radius_meters;

        await user.save();
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Gets the current user's full profile including role.
 */
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const leaderboard = await GamificationService.getLeaderboard();
        res.json(leaderboard);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const identifier = req.userIdentifier;
        if (!identifier) return res.status(401).json({ error: 'Not authenticated' });

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        console.log(`[UserController] getMyProfile identity=${identifier}, isUUID=${isUUID}`);
        
        const orConditions: any[] = [
            { phone: identifier },
            { email: identifier }
        ];
        
        if (isUUID) {
            orConditions.push({ id: identifier });
        }

        const user = await User.findOne({ 
            where: {
                [Op.or]: orConditions
            },
            include: [
                { model: Department, as: 'department' },
                { model: Ward, as: 'ward' }
            ]
        });
        
        if (!user) return res.status(404).json({ error: 'Profile not found' });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Registers or updates a device's FCM token for push notifications.
 */
export const updateDeviceToken = async (req: AuthRequest, res: Response) => {
    try {
        const { fcm_token } = req.body;
        const userAuth = (req as any).user;

        if (!userAuth || !userAuth.id) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!fcm_token) {
            return res.status(400).json({ error: 'fcm_token is required' });
        }

        // Upsert device token
        const [device, created] = await UserDevice.findOrCreate({
            where: { fcm_token },
            defaults: {
                user_id: userAuth.id,
                fcm_token
            }
        });

        if (!created && device.user_id !== userAuth.id) {
            // Token belongs to someone else now, update owner
            device.user_id = userAuth.id;
            await device.save();
        }

        res.json({ success: true, message: 'Device token updated' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
