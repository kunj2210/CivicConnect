import type { Request, Response } from 'express';
import { Report } from '../models/Report.js';
import ReportMetadata from '../models/ReportMetadata.js';
import { bucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import { RoutingService } from '../services/routingService.js';

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

        // Upload to Firebase Storage if available (using google-cloud storage logic)
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

                imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                console.log('Step 3: Firebase Upload Success:', imageUrl);
            } catch (fbError: any) {
                console.error('Step 3: Firebase Upload Failed (using fallback):', fbError.message);
            }
        } else {
            console.log('Step 3: Skipping Firebase Upload (No bucket or file)');
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

export const getReportStats = async (_req: Request, res: Response) => {
    try {
        const total = await Report.count();
        const pending = await Report.count({ where: { status: 'Pending' } });
        const inProgress = await Report.count({ where: { status: 'In Progress' } });
        const resolved = await Report.count({ where: { status: 'Resolved' } });

        // Get category breakdown (Aggregated from reports)
        const reports = await Report.findAll();
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
        const { status, category, description, jurisdiction } = req.body;

        const report = await Report.findOne({ where: { report_id: id } });
        if (!report) return res.status(404).json({ error: 'Report not found' });

        // Update PostgreSQL
        if (status) report.status = status;
        if (category) report.category = category;
        await report.save();

        // Update MongoDB Metadata if exists
        const metadata = await ReportMetadata.findOne({ report_id: id as any });
        if (metadata) {
            if (description !== undefined) metadata.description = description;
            if (jurisdiction !== undefined) metadata.jurisdiction = jurisdiction;
            await metadata.save();
        }

        res.json({ success: true, message: 'Report updated successfully' });
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
