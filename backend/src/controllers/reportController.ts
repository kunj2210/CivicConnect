import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Report } from '../models/Report.js';
import ReportMetadata from '../models/ReportMetadata.js';
import { UserDevice } from '../models/UserDevice.js';
import { sendNotificationToUser } from '../services/notificationService.js';
import { bucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { RoutingService } from '../services/routingService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createReport = async (req: Request, res: Response) => {
    console.log('--- Incoming Report Request ---');
    console.log('Body:', req.body);
    console.log('File:', req.file ? 'Received' : 'Not Received');
    try {
        const { category, description, latitude, longitude, citizen_phone, exif_data } = req.body;
        const file = req.file;

        console.log('Step 1: Data extraction success', { category, lat: latitude, long: longitude, citizen_phone });

        const reportId = uuidv4();
        let imageUrl = 'https://via.placeholder.com/400x300.png?text=Report+Image'; // Fallback

        // Identify Jurisdiction
        console.log('Step 2: Identifying jurisdiction...');
        const jurisdiction = await RoutingService.identifyJurisdiction(parseFloat(latitude), parseFloat(longitude));
        console.log('Step 2: Jurisdiction identified:', jurisdiction);

        // Step 3: Handle Multimedia Upload
        if (bucket && file) {
            try {
                console.log('Step 3: Starting Firebase Upload...');
                const fileName = `reports/${reportId}-${file.originalname}`;
                const blob = bucket.file(fileName);
                const blobStream = blob.createWriteStream({
                    metadata: { contentType: file.mimetype },
                });

                await new Promise((resolve, reject) => {
                    blobStream.on('error', reject);
                    blobStream.on('finish', resolve);
                    blobStream.end(file.buffer);
                });

                imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
                console.log('Step 3: Firebase Upload Success:', imageUrl);
            } catch (fbError: any) {
                console.error('Step 3: Firebase Upload Failed, falling back to local storage:', fbError.message);
                imageUrl = await handleLocalStorage(req, file, reportId);
            }
        } else if (file) {
            console.log('Step 3: Firebase Storage unconfigured, using local storage fallback');
            imageUrl = await handleLocalStorage(req, file, reportId);
        } else {
            console.log('Step 3: Skipping Upload (No file provided)');
            imageUrl = `https://placehold.co/800x600/f1f5f9/94a3b8?text=No+Image+Provided`;
        }

        // Save to PostgreSQL (Structured/Spatial)
        console.log('Step 4: Saving to PostgreSQL...');
        await Report.create({
            report_id: reportId,
            category,
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            status: 'Pending',
        });
        console.log('Step 4: PostgreSQL Save Success');

        // Save to MongoDB (Flexible Metadata)
        console.log('Step 5: Saving to MongoDB...');
        await ReportMetadata.create({
            report_id: reportId,
            image_url: imageUrl,
            description,
            exif_data: exif_data ? (typeof exif_data === 'string' ? JSON.parse(exif_data) : exif_data) : {},
            citizen_phone,
            jurisdiction,
        });
        console.log('Step 5: MongoDB Save Success');

        console.log('--- Report Successfully Created ---', reportId);
        res.status(201).json({ success: true, report_id: reportId, jurisdiction });
    } catch (error: any) {
        console.error('CRITICAL ERROR in createReport:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error', stack: error.stack });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const { citizen_phone } = req.query;
        let reports;
        if (citizen_phone) {
            // Find in MongoDB metadata first to get IDs
            const metadata = await ReportMetadata.find({ citizen_phone });
            const reportIds = metadata.map(m => m.report_id);
            reports = await Report.findAll({ where: { report_id: reportIds } });
        } else {
            reports = await Report.findAll();
        }
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportStats = async (req: Request, res: Response) => {
    try {
        const { citizen_phone } = req.query;
        let where: any = {};
        if (citizen_phone) {
            // Find in MongoDB metadata first to get IDs
            const metadata = await ReportMetadata.find({ citizen_phone: citizen_phone as string });
            const reportIds = metadata.map(m => m.report_id);
            where = { report_id: reportIds };
        }

        const total = await Report.count({ where });
        const pending = await Report.count({ where: { ...where, status: 'Pending' } });
        const inProgress = await Report.count({ where: { ...where, status: 'In Progress' } });
        const resolved = await Report.count({ where: { ...where, status: 'Resolved' } });

        // Rank calculation logic
        let rank = 'Newbie';
        if (resolved >= 11) rank = 'Community Hero';
        else if (resolved >= 6) rank = 'Civic Guardian';
        else if (resolved >= 3) rank = 'Active Citizen';
        else if (resolved > 0) rank = 'Beginner';

        // Get category breakdown
        const reports = await Report.findAll({ where });
        const categoryStats: Record<string, number> = {};
        reports.forEach(r => {
            categoryStats[r.category] = (categoryStats[r.category] || 0) + 1;
        });

        res.json({
            summary: [
                { title: 'Total Issues', value: total, color: 'blue', trend: '+0' },
                { title: 'Resolved', value: resolved, color: 'green', trend: '+0' },
                { title: 'In Progress', value: inProgress, color: 'yellow', trend: '+0' },
                { title: 'Pending', value: pending, color: 'red', trend: '+0' },
            ],
            rank,
            total,
            resolved,
            categoryData: Object.entries(categoryStats).map(([name, value]) => ({ name, value }))
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report) {
            return res.status(404).json({ error: 'Report not found in PostgreSQL' });
        }

        const metadata = await ReportMetadata.findOne({ report_id: id as any });

        // Merge data
        const fullReport = {
            ...report.toJSON(),
            metadata: metadata || {}
        };

        res.json(fullReport);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, category, description, jurisdiction, remarks } = req.body;

        const report = await Report.findOne({ where: { report_id: id } });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        const oldStatus = report.status;

        // Update PostgreSQL
        if (status) report.status = status;
        if (category) report.category = category;
        if (remarks) report.remarks = remarks; // Added remarks update
        await report.save();

        // Update MongoDB Metadata if exists
        const metadata = await ReportMetadata.findOne({ report_id: id as any });
        if (metadata) {
            if (description !== undefined) metadata.description = description;
            if (jurisdiction !== undefined) metadata.jurisdiction = jurisdiction;
            await metadata.save();
        }

        if (status && status !== oldStatus) {
            const metadata = await ReportMetadata.findOne({ report_id: id as any });
            if (metadata && metadata.citizen_phone) {
                await sendNotificationToUser(
                    metadata.citizen_phone,
                    'Report Updated',
                    `Your report (#${id}) status has been changed to ${status}.`,
                    { report_id: id, status: status }
                );
            }
        }

        res.json({ success: true, message: 'Report updated successfully', report });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete from PostgreSQL
        const pgDeleted = await Report.destroy({ where: { report_id: id } });

        // Delete from MongoDB
        const mongoDeleted = await ReportMetadata.deleteOne({ report_id: id as any });

        if (pgDeleted === 0 && mongoDeleted.deletedCount === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ success: true, message: 'Report deleted from both databases' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
export const getNearbyReports = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, radius = 10000, exclude_phone } = req.query; // Default 10km
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const lat = parseFloat(latitude as string);
        const lon = parseFloat(longitude as string);
        const rad = parseFloat(radius as string);

        let whereClause: any = sequelize.where(
            sequelize.fn(
                'ST_DistanceSphere',
                sequelize.col('location'),
                sequelize.fn('ST_MakePoint', lon, lat)
            ),
            { [Op.lte]: rad }
        );

        if (exclude_phone) {
            const excludedMetadata = await ReportMetadata.find({ citizen_phone: exclude_phone as string });
            const excludedIds = excludedMetadata.map(m => m.report_id);
            if (excludedIds.length > 0) {
                whereClause = {
                    [Op.and]: [
                        whereClause,
                        { report_id: { [Op.notIn]: excludedIds } }
                    ]
                };
            }
        }

        // ST_DistanceSphere returns distance in meters
        const reports = await Report.findAll({
            where: whereClause,
            order: [
                [
                    sequelize.fn(
                        'ST_DistanceSphere',
                        sequelize.col('location'),
                        sequelize.fn('ST_MakePoint', lon, lat)
                    ),
                    'ASC'
                ]
            ]
        });

        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const registerFcmToken = async (req: Request, res: Response) => {
    try {
        const { user_id, fcm_token } = req.body;
        if (!user_id || !fcm_token) return res.status(400).json({ error: 'user_id and fcm_token are required' });

        console.log(`[FCM] Registering token for user ${user_id}: ${fcm_token}`);
        await UserDevice.upsert({ user_id, fcm_token });
        res.json({ message: 'FCM token registered' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Helper Functions ---

async function handleLocalStorage(req: Request, file: any, reportId: string): Promise<string> {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `${reportId}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);
        console.log('Local storage save success:', fileName);

        // Return full URL
        return `${baseUrl}/uploads/${fileName}`;
    } catch (err: any) {
        console.error('Local storage fallback failed:', err.message);
        return `https://placehold.co/800x600/e2e8f0/475569?text=Storage+Error`;
    }
}
