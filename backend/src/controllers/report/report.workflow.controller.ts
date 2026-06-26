import type { Response } from 'express';
import { User, Issue, Repair } from '../../config/db.js';
import { StorageService } from '../../services/storageService.js';
import { AuditService } from '../../services/auditService.js';
import { sendNotificationToUser, broadcastNotification } from '../../services/notificationService.js';
import { GamificationService } from '../../services/gamificationService.js';
import type { AuthRequest } from './report.utils.js';
import { SENSITIVE_CATEGORIES, obfuscateLocation } from './report.utils.js';

export const proposeResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const file = req.file || req.files?.['image']?.[0] || req.files?.[0];
        const userAuth = (req as any).user;
        
        if (!userAuth) {
            return res.status(401).json({ error: 'User unauthorized' });
        }

        const user = await User.findByPk(userAuth.id);
        if (!user || (user.role !== 'staff' && user.role !== 'authority' && user.role !== 'admin' && user.role !== 'super_admin')) {
            return res.status(403).json({ error: 'Access denied. Only assigned staff or authorities can propose resolution.' });
        }

        if (!file) return res.status(400).json({ error: 'Resolution image required' });

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        // Ensure the staff member is the one assigned
        if (user.role === 'staff' && issue.assigned_staff_id !== user.id) {
            return res.status(403).json({ error: 'Access denied. You are not assigned to this issue.' });
        }

        // Ensure the authority belongs to the same department (if they have one assigned)
        if (user.role === 'authority' && user.department_id && issue.assigned_department_id !== user.department_id) {
            return res.status(403).json({ error: 'Access denied. You do not belong to the department assigned to this issue.' });
        }

        const imageUrl = await StorageService.uploadFile(file, 'repairs') || '';

        await Repair.create({
            issue_id: issue.id,
            worker_id: user.id,
            minio_post_key: imageUrl,
        });

        // 3. Update Issue Status to Pending Confirmation
        issue.status = 'Pending Confirmation';
        await issue.save();

        // 4. Log the submission
        AuditService.log({
            actor_id: user.id,
            event_type: 'report.resolution_proposed',
            target_resource: 'issue',
            target_resource_id: issue.id,
            new_value: { status: 'Pending Confirmation' },
            payload: { repair_image: imageUrl },
        });

        // 5. Notify Authorities for approval
        broadcastNotification(
            `authority_${issue.assigned_department_id}`, 
            'New Resolution to Approve',
            `Staff ${user.phone || ''} has submitted work for issue ${issue.id.slice(0, 8)}.`,
            { issue_id: issue.id, type: 'APPROVAL_REQUIRED' }
        ).catch((err: any) => console.error('[Notification] Authority notify failed:', err));

        // 6. Notify the reporter
        if (issue.reporter_id) {
            sendNotificationToUser(
                issue.reporter_id,
                'Work in Progress',
                `Staff has completed the work for issue ${issue.id.slice(0, 8)}. It is now being verified by authorities.`,
                { issue_id: issue.id, type: 'RESOLUTION_PROPOSED' }
            ).catch((err: any) => console.error('[Notification] Proposal notify failed:', err));
        }

        res.json({ success: true, message: 'Resolution proposed and awaiting authority approval', imageUrl });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const confirmResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userAuth = (req as any).user;

        // 1. Role Check: Only Authority or Admin can confirm
        if (!userAuth || !['authority', 'admin', 'super_admin'].includes(userAuth.role)) {
            return res.status(403).json({ error: 'Access denied. Only authorities can approve resolutions.' });
        }

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        if (issue.status !== 'Pending Confirmation') {
            return res.status(400).json({ error: 'Issue is not awaiting confirmation' });
        }

        // 2. Advance to Dual-Verification (Citizen's turn)
        issue.status = 'Pending Citizen Confirmation';
        await issue.save();

        // 3. Log Authority Approval
        AuditService.log({
            actor_id: userAuth.id,
            event_type: 'report.resolution_confirmed',
            target_resource: 'issue',
            target_resource_id: issue.id,
            old_value: { status: 'Pending Confirmation' },
            new_value: { status: 'Pending Citizen Confirmation' },
        });

        // 4. Notify ALL Reporters to verify
        const reporterIds = issue.reporter_ids || [issue.reporter_id];
        for (const rId of reporterIds) {
            sendNotificationToUser(
                rId as string,
                'Verify Resolution',
                `Authority has approved the work for issue ${issue.id.slice(0, 8)}. Please confirm if you are satisfied.`,
                { issue_id: issue.id, type: 'VERIFICATION_REQUIRED' }
            ).catch((err: any) => console.error('[Notification] Verification notify failed:', err));
        }

        res.json({ success: true, message: 'Resolution approved by authority. Now awaiting citizen confirmation.' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const rejectResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userAuth = (req as any).user;

        // 1. Role Check: Only Authority or Admin can reject
        if (!userAuth || !['authority', 'admin', 'super_admin'].includes(userAuth.role)) {
            return res.status(403).json({ error: 'Access denied. Only authorities can reject resolutions.' });
        }

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        if (issue.status !== 'Pending Confirmation') {
            return res.status(400).json({ error: 'Issue is not awaiting confirmation' });
        }

        // 2. Revert to In Progress
        issue.status = 'In Progress';
        await issue.save();

        // 3. Log Rejection
        AuditService.log({
            actor_id: userAuth.id,
            event_type: 'report.resolution_rejected',
            target_resource: 'issue',
            target_resource_id: issue.id,
            old_value: { status: 'Pending Confirmation' },
            new_value: { status: 'In Progress' },
            payload: { reason: reason || 'Quality of work not satisfactory' },
        });

        // 4. Notify Staff
        if (issue.assigned_staff_id) {
            sendNotificationToUser(
                issue.assigned_staff_id,
                'Resolution Rejected',
                `Your resolution for issue ${issue.id.slice(0, 8)} was rejected. Reason: ${reason || 'Needs more work.'}`,
                { issue_id: issue.id, type: 'TASK_REJECTED' }
            ).catch((err: any) => console.error('[Notification] Rejection notify failed:', err));
        }

        res.json({ success: true, message: 'Resolution rejected, issue returned to staff' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const citizenConfirmResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const userAuth = (req as any).user;

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        // 1. Verify this user is the reporter (or one of the reporters)
        const reporterIds = issue.reporter_ids || [issue.reporter_id];
        if (!userAuth || !reporterIds.includes(userAuth.id)) {
            return res.status(403).json({ error: 'Access denied. Only the original reporter can verify the resolution.' });
        }

        if (issue.status !== 'Pending Citizen Confirmation') {
            return res.status(400).json({ error: 'Issue is not awaiting citizen confirmation' });
        }

        // 2. Finalize Issue
        issue.status = 'Resolved';
        await issue.save();

        // 3. Close the repair record
        const repair = await Repair.findOne({ where: { issue_id: issue.id }, order: [['createdAt', 'DESC']] });
        if (repair) {
            repair.closed_at = new Date();
            await repair.save();
        }

        // 4. Calculate & Award Credits
        const baseCredits = GamificationService.calculateCredits(issue.priority_score, !!issue.minio_pre_key, !!issue.minio_audio_key);
        const bonusCredits = 20; // Bonus for verifying
        const totalAwarded = baseCredits + bonusCredits;

        for (const rId of reporterIds) {
            await GamificationService.addCredits(rId as string, totalAwarded, 'RESOLVED_AND_VERIFIED');
            
            // Check milestones
            const rUser = await User.findByPk(rId);
            const rReportCount = await Issue.count({ where: { reporter_id: rId as string } });
            if (rUser) {
                GamificationService.checkMilestones(rId as string, rReportCount, rUser.green_credits, 1);
            }
        }

        // 5. Log & Notify
        AuditService.log({
            actor_id: userAuth.id,
            event_type: 'report.citizen_confirmed',
            target_resource: 'issue',
            target_resource_id: issue.id,
            old_value: { status: 'Pending Citizen Confirmation' },
            new_value: { status: 'Resolved' },
            payload: { credits_awarded: totalAwarded },
        });

        // 6. Notify Staff
        if (issue.assigned_staff_id) {
            sendNotificationToUser(
                issue.assigned_staff_id,
                'Great Job! 🌟',
                `The reporter has verified your work for issue ${issue.id.slice(0, 8)}. Keep up the good work!`,
                { issue_id: issue.id, type: 'WORK_VERIFIED' }
            ).catch((err: any) => console.error('[Notification] Staff verification notify failed:', err));
        }

        res.json({ success: true, message: 'Thank you for verifying! Credits have been awarded.', creditsAwarded: totalAwarded });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const citizenDisputeResolution = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userAuth = (req as any).user;

        const issue = await Issue.findByPk(id as string);
        if (!issue) return res.status(404).json({ error: 'Issue not found' });

        const reporterIds = issue.reporter_ids || [issue.reporter_id];
        if (!userAuth || !reporterIds.includes(userAuth.id)) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        issue.status = 'Disputed';
        await issue.save();

        AuditService.log({
            actor_id: userAuth.id,
            event_type: 'report.citizen_disputed',
            target_resource: 'issue',
            target_resource_id: issue.id,
            old_value: { status: 'Pending Citizen Confirmation' },
            new_value: { status: 'Disputed' },
            payload: { reason },
        });

        // Notify Authority & Staff
        if (issue.assigned_staff_id) {
            sendNotificationToUser(
                issue.assigned_staff_id,
                'Resolution Disputed',
                `The reporter was not satisfied with the work for issue ${issue.id.slice(0, 8)}. Reason: ${reason}`,
                { issue_id: issue.id, type: 'WORK_DISPUTED' }
            ).catch((err: any) => console.error('[Notification] Staff dispute notify failed:', err));
        }

        broadcastNotification(
            `authority_${issue.assigned_department_id}`,
            'Citizen Dispute Raised',
            `Issue ${issue.id.slice(0, 8)} has been disputed by the reporter. Manual review required.`,
            { issue_id: issue.id, type: 'DISPUTE_RAISED' }
        ).catch((err: any) => console.error('[Notification] Authority dispute notify failed:', err));

        res.json({ success: true, message: 'Dispute recorded. A municipal authority will review this shortly.' });

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
