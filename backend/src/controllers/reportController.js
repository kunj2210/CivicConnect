import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';
import { Report } from '../models/Report.js';
import ReportMetadata from '../models/ReportMetadata.js';
import CitizenProfile from '../models/CitizenProfile.js';
import { UserDevice } from '../models/UserDevice.js';
import { Department } from '../models/Department.js';
import { sendNotificationToUser } from '../services/notificationService.js';
import { bucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { RoutingService } from '../services/routingService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const createReport = async (req, res) => {
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
            }
            catch (fbError) {
                console.error('Step 3: Firebase Upload Failed, falling back to local storage:', fbError.message);
                imageUrl = await handleLocalStorage(req, file, reportId);
            }
        }
        else if (file) {
            console.log('Step 3: Firebase Storage unconfigured, using local storage fallback');
            imageUrl = await handleLocalStorage(req, file, reportId);
        }
        else {
            console.log('Step 3: Skipping Upload (No file provided)');
            imageUrl = `https://placehold.co/800x600/f1f5f9/94a3b8?text=No+Image+Provided`;
        }
        // Step 4: Deterministic Department Auto-Assignment
        console.log('Step 4: Assigning Department...');
        const departments = await Department.findAll();
        let assignedDepartmentId = null;
        for (const dept of departments) {
            if (dept.handled_categories && dept.handled_categories.includes(category)) {
                assignedDepartmentId = dept.id;
                break;
            }
        }
        console.log(`Step 4: Assigned Department ID: ${assignedDepartmentId}`);
        // Step 4.5: Calculate Priority Score and SLA Deadline
        let priorityScore = 30; // Default low
        let slaDays = 7;
        const highPriority = ['Potholes', 'Road Surface Degradation', 'Water Leakage', 'Missing Manhole Covers', 'Fallen Lines'];
        const medPriority = ['Uncleared Garbage', 'Dead Animals', 'Malfunctioning Streetlights', 'Illegal Construction', 'Encroachment'];
        if (highPriority.some(cat => category.includes(cat))) {
            priorityScore = 80;
            slaDays = 1; // 24 hours SLA
        }
        else if (medPriority.some(cat => category.includes(cat))) {
            priorityScore = 50;
            slaDays = 3;
        }
        // Mock User Credibility Adjustment
        if (citizen_phone && citizen_phone !== 'anonymous') {
            priorityScore += 10;
        }
        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + slaDays);
        console.log(`Step 4.5: Priority Score: ${priorityScore}, SLA Deadline: ${slaDeadline}`);
        // Save to PostgreSQL (Structured/Spatial)
        console.log('Step 5: Saving to PostgreSQL...');
        await Report.create({
            report_id: reportId,
            category,
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            status: 'Pending',
            assigned_department_id: assignedDepartmentId,
            priority_score: priorityScore,
            sla_deadline: slaDeadline,
        });
        console.log('Step 5: PostgreSQL Save Success');
        // Save to MongoDB (Flexible Metadata)
        console.log('Step 6: Saving to MongoDB...');
        await ReportMetadata.create({
            report_id: reportId,
            image_url: imageUrl,
            description,
            exif_data: exif_data ? (typeof exif_data === 'string' ? JSON.parse(exif_data) : exif_data) : {},
            citizen_phone,
            jurisdiction,
            assigned_department_id: assignedDepartmentId,
        });
        console.log('Step 6: MongoDB Save Success');
        console.log('--- Report Successfully Created ---', reportId);
        res.status(201).json({ success: true, report_id: reportId, jurisdiction });
    }
    catch (error) {
        console.error('CRITICAL ERROR in createReport:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error', stack: error.stack });
    }
};
export const getReports = async (req, res) => {
    try {
        const { citizen_phone, departmentId } = req.query;
        let reports;
        if (citizen_phone) {
            // Find in MongoDB metadata first to get IDs
            const metadata = await ReportMetadata.find({ citizen_phone: citizen_phone });
            const reportIds = metadata.map(m => m.report_id);
            reports = await Report.findAll({ where: { report_id: reportIds } });
            const metadataMap = new Map();
            metadata.forEach(m => metadataMap.set(m.report_id, m));
            const fullReports = reports.map(r => {
                const rJson = r.toJSON();
                const m = metadataMap.get(rJson.report_id);
                return {
                    ...rJson,
                    description: m?.description,
                    timestamp: m?.createdAt || rJson.createdAt,
                    metadata: m || {}
                };
            });
            return res.json(fullReports);
        }
        else {
            let whereClause = {};
            if (departmentId) {
                const department = await Department.findByPk(departmentId);
                if (department && department.handled_categories && department.handled_categories.length > 0) {
                    whereClause.category = { [Op.in]: department.handled_categories };
                }
                else if (department && department.handled_categories && department.handled_categories.length === 0) {
                    // Department handles no categories, return empty array immediately
                    return res.json([]);
                }
            }
            reports = await Report.findAll({ where: whereClause });
            const reportIds = reports.map(r => r.report_id);
            const metadata = await ReportMetadata.find({ report_id: { $in: reportIds } });
            const metadataMap = new Map();
            metadata.forEach(m => metadataMap.set(m.report_id, m));
            const fullReports = reports.map(r => {
                const rJson = r.toJSON();
                const m = metadataMap.get(rJson.report_id);
                return {
                    ...rJson,
                    description: m?.description,
                    timestamp: m?.createdAt || rJson.createdAt
                };
            });
            return res.json(fullReports);
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getReportStats = async (req, res) => {
    try {
        const { citizen_phone } = req.query;
        let where = {};
        if (citizen_phone) {
            // Find in MongoDB metadata first to get IDs
            const metadata = await ReportMetadata.find({ citizen_phone: citizen_phone });
            const reportIds = metadata.map(m => m.report_id);
            where = { report_id: reportIds };
        }
        const total = await Report.count({ where });
        const pending = await Report.count({ where: { ...where, status: 'Pending' } });
        const inProgress = await Report.count({ where: { ...where, status: 'In Progress' } });
        const resolved = await Report.count({ where: { ...where, status: 'Resolved' } });
        // Rank calculation logic
        let rank = 'Newbie';
        if (resolved >= 11)
            rank = 'Community Hero';
        else if (resolved >= 6)
            rank = 'Civic Guardian';
        else if (resolved >= 3)
            rank = 'Active Citizen';
        else if (resolved > 0)
            rank = 'Beginner';
        // Get category breakdown
        const reports = await Report.findAll({ where });
        const categoryStats = {};
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report) {
            return res.status(404).json({ error: 'Report not found in PostgreSQL' });
        }
        const metadata = await ReportMetadata.findOne({ report_id: id });
        // Merge data
        const fullReport = {
            ...report.toJSON(),
            metadata: metadata || {}
        };
        res.json(fullReport);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, category, description, jurisdiction, remarks } = req.body;
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        const oldStatus = report.status;
        // Update PostgreSQL
        if (status)
            report.status = status;
        if (category)
            report.category = category;
        if (remarks)
            report.remarks = remarks; // Added remarks update
        await report.save();
        // Update MongoDB Metadata if exists
        const metadata = await ReportMetadata.findOne({ report_id: id });
        if (metadata) {
            if (description !== undefined)
                metadata.description = description;
            if (jurisdiction !== undefined)
                metadata.jurisdiction = jurisdiction;
            await metadata.save();
        }
        if (status && status !== oldStatus) {
            const metadata = await ReportMetadata.findOne({ report_id: id });
            if (metadata && metadata.citizen_phone) {
                await sendNotificationToUser(metadata.citizen_phone, 'Report Updated', `Your report (#${id}) status has been changed to ${status}.`, { report_id: id, status: status });
            }
        }
        res.json({ success: true, message: 'Report updated successfully', report });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete from PostgreSQL
        const pgDeleted = await Report.destroy({ where: { report_id: id } });
        // Delete from MongoDB
        const mongoDeleted = await ReportMetadata.deleteOne({ report_id: id });
        if (pgDeleted === 0 && mongoDeleted.deletedCount === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ success: true, message: 'Report deleted from both databases' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getNearbyReports = async (req, res) => {
    try {
        const { latitude, longitude, radius = 10000, exclude_phone } = req.query; // Default 10km
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const rad = parseFloat(radius);
        let whereClause = sequelize.where(sequelize.fn('ST_DistanceSphere', sequelize.col('location'), sequelize.fn('ST_MakePoint', lon, lat)), { [Op.lte]: rad });
        if (exclude_phone) {
            const excludedMetadata = await ReportMetadata.find({ citizen_phone: exclude_phone });
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
                    sequelize.fn('ST_DistanceSphere', sequelize.col('location'), sequelize.fn('ST_MakePoint', lon, lat)),
                    'ASC'
                ]
            ]
        });
        const reportIds = reports.map(r => r.report_id);
        const metadata = await ReportMetadata.find({ report_id: { $in: reportIds } });
        const metadataMap = new Map();
        metadata.forEach(m => metadataMap.set(m.report_id, m));
        const fullReports = reports.map(r => {
            const rJson = r.toJSON();
            const m = metadataMap.get(rJson.report_id);
            return {
                ...rJson,
                description: m?.description,
                timestamp: m?.createdAt || rJson.createdAt,
                image_url: m?.image_url,
                metadata: m || {}
            };
        });
        res.json(fullReports);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const proposeResolution = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: 'Resolution image is required' });
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        if (report.status !== 'In Progress' && report.status !== 'Pending') {
            return res.status(400).json({ error: 'Report is not in a resolvable state' });
        }
        const reportId = id;
        let imageUrl = '';
        // Handle image upload similar to createReport
        if (bucket && file) {
            try {
                const fileName = `resolutions/${reportId}-${file.originalname}`;
                const blob = bucket.file(fileName);
                const blobStream = blob.createWriteStream({ metadata: { contentType: file.mimetype } });
                await new Promise((resolve, reject) => {
                    blobStream.on('error', reject);
                    blobStream.on('finish', resolve);
                    blobStream.end(file.buffer);
                });
                imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
            }
            catch (error) {
                imageUrl = await handleLocalStorage(req, file, `res-${reportId}`);
            }
        }
        else {
            imageUrl = await handleLocalStorage(req, file, `res-${reportId}`);
        }
        // Update Postgres
        report.status = 'Pending Confirmation';
        await report.save();
        // Update Mongo
        const metadata = await ReportMetadata.findOne({ report_id: id });
        if (metadata) {
            metadata.resolution_image_url = imageUrl;
            metadata.resolution_time = new Date();
            await metadata.save();
            // Send Notification
            if (metadata.citizen_phone) {
                await sendNotificationToUser(metadata.citizen_phone, 'Review Required', `Your report (#${id}) has been marked as resolved by the worker. Please confirm to close the issue.`, { report_id: id, status: 'Pending Confirmation' });
            }
        }
        res.json({ success: true, message: 'Resolution proposed successfully', imageUrl });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const confirmResolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback_rating } = req.body;
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        if (report.status !== 'Pending Confirmation') {
            return res.status(400).json({ error: 'Report is not awaiting confirmation' });
        }
        report.status = 'Resolved';
        await report.save();
        const metadata = await ReportMetadata.findOne({ report_id: id });
        if (metadata) {
            if (feedback_rating !== undefined)
                metadata.citizen_feedback_rating = Number(feedback_rating);
            await metadata.save();
            // Phase 3 Gamification: Award Green Credits explicitly based on resolved priority
            if (metadata.citizen_phone && metadata.citizen_phone !== 'anonymous') {
                const creditsEarned = report.priority_score * 10;
                await CitizenProfile.findOneAndUpdate({ identifier: metadata.citizen_phone }, { $inc: { green_credits: creditsEarned } }, { upsert: true, new: true });
                console.log(`[Gamification] Awarded ${creditsEarned} Green Credits to ${metadata.citizen_phone} for resolving report ${id}`);
            }
        }
        res.json({ success: true, message: 'Resolution confirmed by citizen. Issue closed and Green Credits awarded.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const upvoteReport = async (req, res) => {
    try {
        const id = req.params.id;
        const identifier = req.body.identifier;
        if (!identifier)
            return res.status(400).json({ error: 'Citizen identifier required for upvoting' });
        const report = await Report.findOne({ where: { report_id: id } });
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        // Phase 3 Upvoting Logic: Prevent duplicate votes
        const citizen = await CitizenProfile.findOne({ identifier });
        if (citizen && citizen.upvoted_reports.includes(id)) {
            return res.status(400).json({ error: 'You have already upvoted this report' });
        }
        // 1. Tag user profile
        await CitizenProfile.findOneAndUpdate({ identifier: identifier }, { $addToSet: { upvoted_reports: id } }, { upsert: true });
        // 2. Update Mongo Metadata total count
        const metadata = await ReportMetadata.findOne({ report_id: id });
        if (metadata) {
            metadata.upvote_count = (metadata.upvote_count || 0) + 1;
            await metadata.save();
        }
        // 3. Dynamic Escalation: mathematically bump postgres priority and contract SLA
        report.priority_score += 5; // +5 priority per upvote
        if (report.sla_deadline) {
            // Subtract 2 hours per upvote from deadline
            const newDeadline = new Date(report.sla_deadline);
            newDeadline.setHours(newDeadline.getHours() - 2);
            report.sla_deadline = newDeadline;
        }
        await report.save();
        res.json({ success: true, message: 'Report upvoted successfully', priority_score: report.priority_score });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getGeoJSONReports = async (req, res) => {
    try {
        const { departmentId, status } = req.query;
        let whereClause = '';
        const replacements = {};
        if (departmentId) {
            whereClause += ' AND assigned_department_id = :did';
            replacements.did = Number(departmentId);
        }
        if (status) {
            whereClause += ' AND status = :st';
            replacements.st = status;
        }
        const query = `
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', COALESCE(jsonb_agg(feature), '[]'::jsonb)
            ) as geojson
            FROM (
                SELECT jsonb_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(location)::jsonb,
                    'properties', to_jsonb(r.*) - 'location'
                ) AS feature
                FROM reports r
                WHERE 1=1 ${whereClause}
            ) features;
        `;
        const [result] = await sequelize.query(query, { replacements });
        const geojson = result[0]?.geojson || { type: 'FeatureCollection', features: [] };
        res.json(geojson);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getAuthorityKPIs = async (req, res) => {
    try {
        const { departmentId } = req.query;
        let pWhere = {};
        if (departmentId)
            pWhere.assigned_department_id = departmentId;
        // Fetch all relevant reports
        const reports = (await Report.findAll({ where: pWhere })).map(r => r.toJSON());
        const total = reports.length;
        if (total === 0) {
            return res.json({ firstResponseTime: 0, slaCompliance: 0, firstTimeFix: 100, satisfactionScore: 0 });
        }
        // SLA Compliance Calculation
        const resolvedReports = reports.filter(r => r.status === 'Resolved');
        let slaCompliance = 100;
        if (resolvedReports.length > 0) {
            let compliant = 0;
            const reportIds = resolvedReports.map(r => r.report_id);
            const metadata = await ReportMetadata.find({ report_id: { $in: reportIds } });
            const mMap = new Map();
            metadata.forEach(m => mMap.set(m.report_id, m));
            resolvedReports.forEach(r => {
                const m = mMap.get(r.report_id);
                if (r.sla_deadline && m?.resolution_time) {
                    if (new Date(m.resolution_time) <= new Date(r.sla_deadline)) {
                        compliant++;
                    }
                }
                else {
                    compliant++;
                }
            });
            slaCompliance = Math.round((compliant / resolvedReports.length) * 100);
        }
        // Citizen Satisfaction Score Calculation
        let satisfactionScore = 0;
        let mQuery = { citizen_feedback_rating: { $exists: true } };
        if (departmentId)
            mQuery.assigned_department_id = Number(departmentId);
        const metadataForRating = await ReportMetadata.find(mQuery);
        if (metadataForRating.length > 0) {
            const sum = metadataForRating.reduce((a, b) => a + (b.citizen_feedback_rating || 0), 0);
            satisfactionScore = parseFloat((sum / metadataForRating.length).toFixed(1));
        }
        res.json({
            slaCompliance,
            satisfactionScore,
            firstTimeFix: 92, // Historical average placeholder for MVP
            firstResponseTime: 2.4, // Hours - Placeholder for MVP
            totalIssues: total,
            resolvedCount: resolvedReports.length
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const registerFcmToken = async (req, res) => {
    try {
        const { user_id, fcm_token } = req.body;
        if (!user_id || !fcm_token)
            return res.status(400).json({ error: 'user_id and fcm_token are required' });
        console.log(`[FCM] Registering token for user ${user_id}: ${fcm_token}`);
        await UserDevice.upsert({ user_id, fcm_token });
        res.json({ message: 'FCM token registered' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// --- Helper Functions ---
async function handleLocalStorage(req, file, reportId) {
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
    }
    catch (err) {
        console.error('Local storage fallback failed:', err.message);
        return `https://placehold.co/800x600/e2e8f0/475569?text=Storage+Error`;
    }
}
//# sourceMappingURL=reportController.js.map