import { User } from '../config/db.js';

export const BADGES = {
    FIRST_REPORT: { id: 'first_report', name: 'First Responder', icon: '🎯', description: 'Reported your first civic issue.' },
    CIVIC_GUARDIAN: { id: 'civic_guardian', name: 'Civic Guardian', icon: '🛡️', description: 'Reported 5+ verified issues.' },
    CENTURION: { id: 'centurion', name: 'City Centurion', icon: '🎖️', description: 'Earned over 1000 Green Credits.' },
    TOP_CONTRIBUTOR: { id: 'top_contributor', name: 'Top Contributor', icon: '🌟', description: 'Ranked in the top 10 on the monthly leaderboard.' },
    CITIZEN_VERIFIER: { id: 'citizen_verifier', name: 'Trusted Verifier', icon: '✅', description: 'Verified 3+ resolutions submitted by staff.' }
};

export const CREDIT_VALUATION = {
    BASE_REPORT: 50,
    HIGH_PRIORITY_BONUS: 25,
    IMAGE_EVIDENCE_BONUS: 10,
    AUDIO_EVIDENCE_BONUS: 5,
    RESOLUTION_CONFIRMATION: 20,
    UPVOTE_RECEIVED: 2
};

export class GamificationService {
    /**
     * Awards a badge to a user if they don't already have it.
     */
    static async awardBadge(userId: string, badgeId: string) {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const achievements = user.achievements || [];
            const alreadyHas = achievements.some((a: any) => a.badgeId === badgeId);

            if (!alreadyHas) {
                const newAchievement = {
                    badgeId,
                    awardedAt: new Date(),
                    ...BADGES[badgeId as keyof typeof BADGES]
                };
                
                // Update achievements using Sequelize literal or array spread
                const updatedAchievements = [...achievements, newAchievement];
                await User.update(
                    { achievements: updatedAchievements },
                    { where: { id: userId } }
                );
                
                console.log(`[GAMIFICATION] Badge awarded to ${userId}: ${badgeId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error awarding badge:', error);
            return false;
        }
    }

    /**
     * Checks for milestone-based badges (e.g., first report).
     */
    static async checkMilestones(userId: string, reportCount: number, totalCredits: number, verificationCount = 0) {
        if (reportCount >= 1) {
            await this.awardBadge(userId, BADGES.FIRST_REPORT.id);
        }
        if (reportCount >= 5) {
            await this.awardBadge(userId, BADGES.CIVIC_GUARDIAN.id);
        }
        if (totalCredits >= 1000) {
            await this.awardBadge(userId, BADGES.CENTURION.id);
        }
        if (verificationCount >= 3) {
            await this.awardBadge(userId, BADGES.CITIZEN_VERIFIER.id);
        }
    }

    /**
     * Calculates credits based on the quality and impact of the report.
     */
    static calculateCredits(priorityScore: number, hasImage: boolean, hasAudio: boolean): number {
        let total = CREDIT_VALUATION.BASE_REPORT;
        
        if (priorityScore > 70) total += CREDIT_VALUATION.HIGH_PRIORITY_BONUS;
        if (hasImage) total += CREDIT_VALUATION.IMAGE_EVIDENCE_BONUS;
        if (hasAudio) total += CREDIT_VALUATION.AUDIO_EVIDENCE_BONUS;
        
        return total;
    }

    /**
     * Atomically adds credits to a user.
     */
    static async addCredits(userId: string, amount: number, reason: string) {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            const newTotal = (user.green_credits || 0) + amount;
            await user.update({ green_credits: newTotal });
            
            console.log(`[CREDITS] Awarded ${amount} to ${userId}. Reason: ${reason}. New Total: ${newTotal}`);
            return true;
        } catch (error) {
            console.error('Error adding credits:', error);
            return false;
        }
    }

    /**
     * Retrieves the global leaderboard.
     */
    static async getLeaderboard(limit = 10) {
        try {
            return await User.findAll({
                where: { role: 'citizen' },
                attributes: ['id', 'phone', 'email', 'green_credits', 'achievements'],
                order: [['green_credits', 'DESC']],
                limit
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }
}
