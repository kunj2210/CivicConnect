import type { Response } from 'express';
import { Op } from 'sequelize';
import { sequelize, User, Issue, Repair } from '../../config/db.js';
import { StorageService } from '../../services/storageService.js';
import type { AuthRequest } from './report.utils.js';
import { SENSITIVE_CATEGORIES, obfuscateLocation } from './report.utils.js';

export const getReports = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { ward_id, status, assigned_staff_id } = req.query;
        const whereClause: any = {};
        const user = req.user;
        const userRole = (user?.role || 'citizen').toLowerCase();

        // Server-Side RBAC Filtering
        const permissions: string[] = user?.permissions || [];
        const cityScopedRoles = ['admin', 'mayor'];

        if (cityScopedRoles.includes(userRole) && user?.ulb_id) {
            const { Ward } = await import('../../config/db.js');
            const cityWards = await Ward.findAll({ where: { ulb_id: user.ulb_id }, attributes: ['id'] });
            const cityWardIds = cityWards.map((w: any) => w.id);
            whereClause.ward_id = { [Op.in]: cityWardIds };
            if (ward_id && cityWardIds.includes(ward_id as string)) {
                whereClause.ward_id = ward_id;
            }
            if (assigned_staff_id) whereClause.assigned_staff_id = assigned_staff_id;
        } else if (permissions.includes('report:view_all')) {
            if (ward_id) whereClause.ward_id = ward_id;
            if (assigned_staff_id) whereClause.assigned_staff_id = assigned_staff_id;
            if (userRole === 'field_officer' || userRole === 'staff') {
                whereClause.assigned_staff_id = user?.id;
            } else if (userRole === 'dept_head' || userRole === 'authority') {
                if (user?.ward_id) whereClause.ward_id = user.ward_id;
                if (user?.department_id) whereClause.assigned_department_id = user.department_id;
            }
        } else if (permissions.includes('report:view_area')) {
            if (user?.ward_id) {
                whereClause.ward_id = user.ward_id;
            } else {
                whereClause.ward_id = '00000000-0000-0000-0000-000000000000';
            }
        } else if (permissions.includes('report:view_my')) {
            whereClause.reporter_id = user?.id;
        } else {
            whereClause.id = '00000000-0000-0000-0000-000000000000';
        }

        if (status) whereClause.status = status;

        const issues = await Issue.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        const isPrivileged = ['admin', 'super_admin', 'dept_head', 'field_officer', 'hq_staff', 'authority', 'staff'].includes(userRole);

        const transformedIssues = await Promise.all(issues.map(async (issue) => {
            const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
            const report = issue.get();

            if (isSensitive && !isPrivileged) {
                const [lon, lat] = obfuscateLocation(report.location.coordinates[0], report.location.coordinates[1]);
                report.location = { ...report.location, coordinates: [lon, lat] };
            }

            // Generate Presigned URL for the list view
            if (report.minio_pre_key) {
                report.minio_pre_key = await StorageService.getPresignedUrl(report.minio_pre_key);
            }

            // Fetch associated repair/resolution evidence if it exists
            let resolutionImageUrl: string | null = null;
            if (['Pending Confirmation', 'Pending Citizen Confirmation', 'Resolved'].includes(report.status)) {
                const repair = await Repair.findOne({ where: { issue_id: report.id }, order: [['createdAt', 'DESC']] });
                if (repair && repair.minio_post_key) {
                    resolutionImageUrl = await StorageService.getPresignedUrl(repair.minio_post_key);
                }
            }
            report.resolution_image_url = resolutionImageUrl;
            report.metadata = {
                ...report.metadata,
                resolution_image_url: resolutionImageUrl
            };

            return report;
        }));

        return res.json(transformedIssues);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportStats = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        const userRole = (user?.role || 'citizen').toLowerCase();
        let where: any = {};
        let green_credits = 0;

        // RBAC: Citizens only see their own stats, others see global/departmental
        const permissions: string[] = user?.permissions || [];
        if (permissions.includes('report:view_all') || ['admin', 'mayor'].includes(userRole)) {
            const dbUser = await User.findByPk(user?.id);
            if (dbUser) {
                const cityScopedRoles = ['admin', 'mayor'];
                if (cityScopedRoles.includes(userRole) && dbUser.ulb_id) {
                    const { Ward } = await import('../../config/db.js');
                    const cityWards = await Ward.findAll({ where: { ulb_id: dbUser.ulb_id }, attributes: ['id'] });
                    where.ward_id = { [Op.in]: cityWards.map((w: any) => w.id) };
                } else if (userRole === 'field_officer' || userRole === 'staff') {
                    where = { assigned_staff_id: user?.id };
                } else if (userRole === 'dept_head' || userRole === 'authority') {
                    if (dbUser.ward_id) where.ward_id = dbUser.ward_id;
                    if (dbUser.department_id) where.assigned_department_id = dbUser.department_id;
                }
            }
        } else if (permissions.includes('report:view_area')) {
            const dbUser = await User.findByPk(user?.id);
            if (dbUser && dbUser.ward_id) {
                where.ward_id = dbUser.ward_id;
            } else {
                where.ward_id = '00000000-0000-0000-0000-000000000000';
            }
        } else {
            where = { reporter_id: user?.id };
            const dbUser = await User.findByPk(user?.id);
            if (dbUser) green_credits = dbUser.green_credits;
        }

        const total = await Issue.count({ where });
        const pending = await Issue.count({ where: { ...where, status: 'Pending' } });
        const resolved = await Issue.count({ where: { ...where, status: 'Resolved' } });
        const inProgress = await Issue.count({ where: { ...where, status: 'In Progress' } });

        // Get category distribution
        const categoryCounts = await Issue.findAll({
            where,
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('category')), 'count']
            ],
            group: ['category']
        });

        const categoryData = categoryCounts.map((c: any) => ({
            name: c.category,
            value: parseInt(c.get('count'))
        }));

        res.json({
            summary: [
                { title: 'Total Issues', value: total, trend: 12, color: 'blue' },
                { title: 'Resolved', value: resolved, trend: 8, color: 'emerald' },
                { title: 'Pending', value: pending, trend: -5, color: 'rose' },
                { title: 'In Progress', value: inProgress, trend: 2, color: 'amber' },
            ],
            categoryData,
            total,
            resolved,
            green_credits,
        });
    } catch (error: any) {
        console.error('Error in getReportStats:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });
        // Apply privacy obfuscation for sensitive categories in public view
        const userRole = (req.user?.role || 'citizen').toLowerCase();
        const permissions: string[] = req.user?.permissions || [];
        const isReporter = issue.reporter_id === req.user?.id;
        
        if (permissions.includes('report:view_all')) {
            // Allowed
        } else if (permissions.includes('report:view_area')) {
            if (issue.ward_id !== req.user?.ward_id) {
                return res.status(403).json({ error: 'Forbidden: Issue is outside your assigned ward' });
            }
        } else if (permissions.includes('report:view_my')) {
            if (!isReporter) {
                return res.status(403).json({ error: 'Forbidden: You can only access your own reported issues' });
            }
        } else {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
        const isPrivileged = ['admin', 'super_admin', 'dept_head', 'field_officer', 'hq_staff', 'authority', 'staff'].includes(userRole);

        if (isSensitive && !isPrivileged) {
            const [lon, lat] = obfuscateLocation(issue.location.coordinates[0], issue.location.coordinates[1]);
            issue.location.coordinates = [lon, lat];
        }

        const report = issue.get();

        // 2. Generate Presigned URLs for all media
        if (report.minio_pre_key) report.minio_pre_key = await StorageService.getPresignedUrl(report.minio_pre_key);
        if (report.minio_audio_key) report.minio_audio_key = await StorageService.getPresignedUrl(report.minio_audio_key);
        
        if (report.minio_image_urls && report.minio_image_urls.length > 0) {
            report.minio_image_urls = await Promise.all(report.minio_image_urls.map((url: string) => StorageService.getPresignedUrl(url)));
        }
        
        if (report.minio_audio_urls && report.minio_audio_urls.length > 0) {
            report.minio_audio_urls = await Promise.all(report.minio_audio_urls.map((url: string) => StorageService.getPresignedUrl(url)));
        }

        // Fetch associated repair/resolution evidence if it exists
        let resolutionImageUrl: string | null = null;
        if (['Pending Confirmation', 'Pending Citizen Confirmation', 'Resolved'].includes(report.status)) {
            const repair = await Repair.findOne({ where: { issue_id: report.id }, order: [['createdAt', 'DESC']] });
            if (repair && repair.minio_post_key) {
                resolutionImageUrl = await StorageService.getPresignedUrl(repair.minio_post_key);
            }
        }
        report.resolution_image_url = resolutionImageUrl;
        report.metadata = {
            ...report.metadata,
            resolution_image_url: resolutionImageUrl
        };

        res.json(report);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getGeoJSONReports = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { status } = req.query;
        const user = req.user;
        const userRole = (user?.role || 'citizen').toLowerCase();

        let whereClause: any = {};
        if (status) {
            whereClause.status = status;
        }

        // Apply scoping for City Admin, Mayor, and Councilor
        const cityScopedRoles = ['admin', 'mayor'];
        if (cityScopedRoles.includes(userRole) && user?.ulb_id) {
            const { Ward } = await import('../../config/db.js');
            const cityWards = await Ward.findAll({ where: { ulb_id: user.ulb_id }, attributes: ['id'] });
            whereClause.ward_id = { [Op.in]: cityWards.map((w: any) => w.id) };
        } else if (userRole === 'field_officer' || userRole === 'staff') {
            whereClause.assigned_staff_id = user?.id;
        } else if (userRole === 'dept_head' || userRole === 'authority') {
            if (user?.ward_id) whereClause.ward_id = user.ward_id;
            if (user?.department_id) whereClause.assigned_department_id = user.department_id;
        } else if (userRole === 'councilor' && user?.ward_id) {
            whereClause.ward_id = user.ward_id;
        }

        // Fetch raw issue data
        const issues = await Issue.findAll({
            where: whereClause,
            attributes: [
                'id', 'category', 'status', 'priority_score', 'description', 'image_url',
                'reporter_id', 'assigned_staff_id', 'createdAt', 'updatedAt',
                [sequelize.fn('ST_AsGeoJSON', sequelize.col('location')), 'location_geojson']
            ],
            raw: true, // Get raw data to easily manipulate
        });

        // Filter out issues with no location data to prevent JSON.parse crash
        const issuesWithLocation = issues.filter((issue: any) => !!issue.location_geojson);

        // Transform to GeoJSON and obfuscate if sensitive
        const features = issuesWithLocation.map((issue: any) => {
            let geometry: any;
            try {
                geometry = JSON.parse(issue.location_geojson);
            } catch {
                return null; // Skip malformed geometry
            }
            const coords = geometry?.coordinates;
            if (!coords) return null;

            // Apply privacy obfuscation for sensitive categories in public view
            const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
            const isPrivileged = ['admin', 'super_admin', 'dept_head', 'field_officer', 'hq_staff', 'authority', 'staff'].includes(userRole.toLowerCase());

            if (isSensitive && !isPrivileged) {
                const obfuscated = obfuscateLocation(coords[0], coords[1]);
                geometry.coordinates = obfuscated;
            }

            // Remove the raw geojson string and add the processed geometry
            const properties = { ...issue };
            delete properties.location_geojson;

            return {
                type: 'Feature',
                geometry: geometry,
                properties: properties
            };
        }).filter(Boolean); // Remove any null entries from parse failures

        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        res.json(geojson);
    } catch (error: any) {
        console.error('[GeoJSON] Error building GeoJSON response:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getAuthorityKPIs = async (_req: AuthRequest, res: Response): Promise<any> => {
    try {
        const total = await Issue.count();
        const resolved = await Issue.count({ where: { status: 'Resolved' } });
        const pending = await Issue.count({ where: { status: 'Pending' } });

        res.json({
            totalIssues: total,
            resolvedCount: resolved,
            pendingCount: pending,
            slaCompliance: 85,
            satisfactionScore: 4.5
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getNearbyReports = async (req: AuthRequest, res: Response) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query;
        if (!latitude || !longitude) return res.status(400).json({ error: 'Coordinates missing' });

        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);
        const rad = parseFloat(radius as string);

        const issues = await Issue.findAll({
            where: sequelize.where(
                sequelize.fn('ST_DistanceSphere', sequelize.col('location'), sequelize.fn('ST_MakePoint', lon, lat)),
                { [Op.lte]: rad }
            ),
            order: [[sequelize.fn('ST_DistanceSphere', sequelize.col('location'), sequelize.fn('ST_MakePoint', lon, lat)), 'ASC']]
        });

        res.json(issues);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
