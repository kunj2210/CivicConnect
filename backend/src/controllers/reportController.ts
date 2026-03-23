import type { Request, Response } from 'express';
import { QueryTypes, Op } from 'sequelize';
import { User, Department, Ward, Issue, Repair, AIFeedback, sequelize } from '../config/db.js';
import { sendNotificationToUser } from '../services/notificationService.js';
import { AIService } from '../services/aiService.js';
import { SpatialService } from '../services/spatialService.js';
import { GeoIntelligenceService } from '../services/geoIntelligenceService.js';
import { AuditLog } from '../models/AuditLog.js';

import { StorageService } from '../services/storageService.js';
import { PriorityService } from '../services/priorityService.js';
import { findWardId } from '../utils/spatialUtils.js';
import { GamificationService, BADGES } from '../services/gamificationService.js';


import path from 'path';


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AuthRequest extends Request {
    userIdentifier?: string;
    files?: any;
    user?: any;
}

// Categories that require privacy obfuscation for the reporter
const SENSITIVE_CATEGORIES = ['Illegal Construction', 'Encroachment', 'Criminal Activity', 'Vandalism'];

function obfuscateLocation(lon: number, lat: number) {
    // Add a random offset of ~15-30 meters (approx 0.0001 to 0.0003 degrees)
    const factor = 0.0002;
    const offsetLon = (Math.random() - 0.5) * factor;
    const offsetLat = (Math.random() - 0.5) * factor;
    return [lon + offsetLon, lat + offsetLat];
}





export const createReport = async (req: AuthRequest, res: Response) => {
    console.log('--- Incoming AI-Enhanced Issue Request ---');
    const files = req.files;
    const imageFile = files?.['image']?.[0];
    const audioFile = files?.['audio']?.[0];

    try {
        const { category, description, latitude, longitude } = req.body;
        const userAuth = (req as any).user;

        if (!userAuth) return res.status(401).json({ error: 'User unauthorized' });

        // 1. Ensure user exists in PostgreSQL (Look up by UUID)
        let user = await User.findByPk(userAuth.id);
        if (!user) {
            // Create user if they don't exist in our public table yet
            user = await User.create({ 
                id: userAuth.id, 
                phone: userAuth.phone || null,
                email: userAuth.email || null
            });
        }


        // 2. Identify Ward
        console.log(`[DEBUG] Received Coordinates: Lon=${longitude}, Lat=${latitude}`);
        const ward_id = await findWardId(parseFloat(longitude), parseFloat(latitude));
        console.log(`[DEBUG] Ward Search Result: ${ward_id || 'NOT FOUND'}`);

        if (!ward_id) {
            console.error(`[DEBUG] REJECTED: Location [${longitude}, ${latitude}] outside of served wards`);
            return res.status(400).json({ 
                error: 'Location outside of served wards',
                received_coords: { longitude, latitude },
                hint: 'Ensure your test location is within Mumbai, Delhi, or Ranchi coordinates.'
            });
        }



        // 3. Handle Media & AI Predictions
        let imageUrl = '';
        let imageTop3 = [];
        if (imageFile) {
            imageUrl = await StorageService.uploadFile(imageFile, 'issues') || '';
            try {
                imageTop3 = await AIService.classifyImage(imageFile.buffer, imageFile.originalname);
            } catch (aiError) {
                console.error('Image Classification error:', aiError);
            }
        }

        let audioUrl = '';
        if (audioFile) {
            audioUrl = await StorageService.uploadFile(audioFile, 'audio') || '';
        }

        // 4. LLM Standardization & Voice Translation (Open Source Llama 3)
        // Note: For now, we use user-provided description; real-time Whisper transcription can be added here
        let textTop3 = [];
        try {
            textTop3 = await AIService.standardizeContent(description || '', ''); 
        } catch (textError) {
            console.error('Text Standardization error:', textError);
        }

        // 4.1 Execute Weighted Fusion Logic
        const fusionResult = AIService.calculateAdvancedFusion(imageTop3, [], textTop3);

        // 4.1.5 SPATIAL DEDUPLICATION (Pillar 2)
        // Check if an issue of the same category exists within its dynamic radius
        const duplicate = await SpatialService.findDuplicateIssue(
            parseFloat(latitude), 
            parseFloat(longitude), 
            fusionResult.finalCategory
        );

        if (duplicate) {
            console.log(`[DEDUPLICATION] Matched existing issue ${duplicate.id}. Merging...`);
            await SpatialService.handleDuplicate(duplicate, user.id, imageUrl, audioUrl);
            
            // Log as UPDATE
            await AuditLog.create({
                actor_id: user.id,
                event_type: 'ISSUE_UPDATED_VIA_DEDUPLICATION',
                payload: { issue_id: duplicate.id, new_reporter: user.id },
            });

            return res.status(200).json({
                success: true,
                issue_id: duplicate.id,
                message: 'Duplicate detected. Your report has been merged with an existing case to expedite resolution.',
                is_duplicate: true
            });
        }

        // 4.2 Dynamic Priority Calculation (FR 4)
        const priorityScore = await PriorityService.calculatePriority(
            user.id,
            ward_id,
            parseFloat(longitude),
            parseFloat(latitude),
            (fusionResult.fusionScore * 100) || 50, // Urgency derived from fusion confidence
            imageFile ? 80 : 50,
            fusionResult.needsHumanReview ? 'Uncertain' : 'Verified'
        );

        // 5. Create Issue with Multimodal Evidence
        const issue = await Issue.create({
            reporter_id: user.id,
            ward_id: ward_id,
            location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
            category: fusionResult.finalCategory, // Fused winning category
            description: description || '',
            priority_score: priorityScore,
            status: 'Pending',
            minio_pre_key: imageUrl,
            minio_audio_key: audioUrl,
            reporter_ids: [user.id],
            minio_image_urls: imageUrl ? [imageUrl] : [],
            minio_audio_urls: audioUrl ? [audioUrl] : [],
            ai_image_top3: imageTop3,
            ai_audio_top3: [], // Future: Placeholder for audio-specific top-3
            ai_text_top3: textTop3,
            fusion_final_category: fusionResult.finalCategory,
            fusion_confidence_score: fusionResult.fusionScore,
            needs_human_review: fusionResult.needsHumanReview
        });





        // 6. Log
        await AuditLog.create({
            actor_id: user.id,
            event_type: 'ISSUE_CREATED',
            payload: { issue_id: issue.id },
        });

        // 6.2 Check Gamification Milestones
        const reportCount = await Issue.count({ where: { reporter_id: user.id } });
        GamificationService.checkMilestones(user.id, reportCount, user.green_credits || 0);


        // 5.5 Trigger Proactive Neighborhood Alerts (Pillar 5)
        // This is non-blocking to ensure fast response to the reporter
        GeoIntelligenceService.notifyNearbyCitizens(
            issue.id,
            issue.category,
            parseFloat(latitude),
            parseFloat(longitude),
            user.id
        ).catch(err => console.error('[GeoIntelligence] Proactive Alert Failed:', err));


        // 7. Notify User
        await sendNotificationToUser(
            user.id,
            'Issue Reported Successfully',
            `Your report for ${issue.category} has been received.`,
            { issue_id: issue.id }
        );


        res.status(201).json({
            success: true,
            issue_id: issue.id,
            ai_summary: `AI Analysis complete: Verified as ${issue.category} (${(issue.fusion_confidence_score! * 100).toFixed(1)}% confidence).`
        });

    } catch (error: any) {
        console.error('CRITICAL ERROR in createIssue:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { ward_id, status, assigned_staff_id } = req.query;
        const whereClause: any = {};

        if (ward_id) whereClause.ward_id = ward_id;
        if (status) whereClause.status = status;
        if (assigned_staff_id) {
            if (assigned_staff_id === 'me') {
                whereClause.assigned_staff_id = req.user?.id;
            } else {
                whereClause.assigned_staff_id = assigned_staff_id;
            }
        }

        const issues = await Issue.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });



        const userRole = req.user?.role || 'citizen';
        const isPrivileged = userRole === 'admin' || userRole === 'authority' || userRole === 'staff';

        const transformedIssues = issues.map(issue => {
            const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
            const report = issue.get();
            
            if (isSensitive && !isPrivileged) {
                const [lon, lat] = obfuscateLocation(report.location.coordinates[0], report.location.coordinates[1]);
                report.location = { ...report.location, coordinates: [lon, lat] };
            }
            return report;
        });

        return res.json(transformedIssues);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportStats = async (req: AuthRequest, res: Response) => {
    try {
        const phone = req.userIdentifier;
        let where: any = {};
        let green_credits = 0;

        if (phone) {
            const user = await User.findOne({ where: { phone } });
            if (user) {
                where = { reporter_id: user.id };
                green_credits = user.green_credits;
            }
        }

        const total = await Issue.count({ where });
        const pending = await Issue.count({ where: { ...where, status: 'Pending' } });
        const resolved = await Issue.count({ where: { ...where, status: 'Resolved' } });

        res.json({
            summary: [
                { title: 'Total Issues', value: total, color: 'blue' },
                { title: 'Resolved', value: resolved, color: 'green' },
                { title: 'Pending', value: pending, color: 'red' },
            ],
            total,
            resolved,
            green_credits,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });
        // Apply privacy obfuscation for sensitive categories in public view
        const userRole = req.user?.role || 'citizen';
        const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
        const isPrivileged = userRole === 'admin' || userRole === 'authority' || userRole === 'staff';

        if (isSensitive && !isPrivileged) {
            const [lon, lat] = obfuscateLocation(issue.location.coordinates[0], issue.location.coordinates[1]);
            issue.location.coordinates = [lon, lat];
        }

        res.json(issue);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, category, priority_score, assigned_staff_id } = req.body;

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        if (status) issue.status = status;
        if (category && issue.category !== category) {
            // Discrepancy detected: Log to AI Retraining Queue
            try {
                await AIFeedback.create({
                    issue_id: issue.id,
                    original_category: issue.category,
                    corrected_category: category,
                    media_url: (issue.minio_image_urls && issue.minio_image_urls.length > 0) ? issue.minio_image_urls[0] : (issue.minio_pre_key || null)
                });
                console.log(`[AI FEEDBACK] Issue ${issue.id} corrected from ${issue.category} to ${category}`);
            } catch (err) {
                console.error("Failed to log AI Feedback", err);
            }
            issue.category = category;
        }
        if (priority_score !== undefined) issue.priority_score = priority_score;
        if (assigned_staff_id !== undefined) issue.assigned_staff_id = assigned_staff_id;

        await issue.save();

        res.json({ success: true, issue });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Issue.destroy({ where: { id } });
        if (deleted === 0) return res.status(404).json({ error: 'Issue not found' });
        res.json({ success: true, message: 'Issue deleted successfully' });
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

export const proposeResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const file = req.files?.['image']?.[0] || req.files?.[0];
        const phone = req.userIdentifier;

        if (!file) return res.status(400).json({ error: 'Resolution image required' });

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        const imageUrl = await StorageService.uploadFile(file, 'repairs') || '';


        const user = await User.findOne({ where: { phone } });
        if (!user) return res.status(401).json({ error: 'User profile missing' });

        issue.status = 'Pending Confirmation';
        await issue.save();

        await Repair.create({
            issue_id: issue.id,
            worker_id: user.id,
            minio_post_key: imageUrl,
        });

        res.json({ success: true, message: 'Resolution proposed', imageUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const confirmResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const phone = req.userIdentifier;

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        if (issue.status !== 'Pending Confirmation') {
            return res.status(400).json({ error: 'Issue is not awaiting confirmation' });
        }

        issue.status = 'Resolved';
        await issue.save();

        // Award Green Credits to ALL citizens who reported this issue (Pillar 2)
        const reporterIds = issue.reporter_ids || [issue.reporter_id];
        const creditAmount = Math.round((issue.priority_score || 0) * 10);

        if (reporterIds.length > 0) {
            await User.update(
                { green_credits: sequelize.literal(`green_credits + ${creditAmount}`) },
                { where: { id: { [Op.in]: reporterIds } } }
            );
            console.log(`[CREDITS] Awarded ${creditAmount} credits to ${reporterIds.length} reporters.`);
            
            // Check Gamification Milestones for all reporters
            for (const rId of reporterIds) {
                const rUser = await User.findByPk(rId);
                if (rUser) {
                    const rReportCount = await Issue.count({ where: { reporter_id: rId as string } });
                    GamificationService.checkMilestones(rId as string, rReportCount, rUser.green_credits);
                }
            }
        }



        res.json({ success: true, message: 'Resolution confirmed and credits awarded' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const upvoteReport = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        issue.priority_score += 5;
        await issue.save();

        res.json({ success: true, priority_score: issue.priority_score });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

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

export const getGeoJSONReports = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { status } = req.query;
        const userRole = req.user?.role || 'citizen'; // Assuming req.user is populated by auth middleware

        let whereClause: any = {};
        if (status) {
            whereClause.status = status;
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

        // Transform to GeoJSON and obfuscate if sensitive
        const features = issues.map((issue: any) => {
            let geometry = JSON.parse(issue.location_geojson);
            let coords = geometry.coordinates;
            
            // Apply privacy obfuscation for sensitive categories in public view
            const isSensitive = SENSITIVE_CATEGORIES.includes(issue.category);
            const isPrivileged = userRole === 'admin' || userRole === 'authority' || userRole === 'staff';
            
            if (isSensitive && !isPrivileged) {
                coords = obfuscateLocation(coords[0], coords[1]);
                geometry.coordinates = coords;
            }

            // Remove the raw geojson string and add the processed geometry
            const properties = { ...issue };
            delete properties.location_geojson;
            
            return {
                type: 'Feature',
                geometry: geometry,
                properties: properties
            };
        });

        const geojson = {
            type: 'FeatureCollection',
            features: features
        };

        res.json(geojson);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAuthorityKPIs = async (req: AuthRequest, res: Response): Promise<any> => {
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

export const getRetrainingQueue = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userRole = (req.user?.role || 'citizen').toLowerCase();
        const isPrivileged = userRole === 'admin' || userRole === 'authority' || userRole === 'staff' || userRole === 'super_admin';
        
        if (!isPrivileged) return res.status(403).json({ error: 'Access denied. You must be an admin or staff member.' });

        const queue = await AIFeedback.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(queue);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



