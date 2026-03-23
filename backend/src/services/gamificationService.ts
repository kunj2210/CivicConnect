import { User } from '../config/db.js';

export const BADGES = {
    FIRST_REPORT: { id: 'first_report', name: 'First Responder', icon: '🎯', description: 'Reported your first civic issue.' },
    CIVIC_GUARDIAN: { id: 'civic_guardian', name: 'Civic Guardian', icon: '🛡️', description: 'Reported 5+ verified issues.' },
    CENTURION: { id: 'centurion', name: 'City Centurion', icon: '🎖️', description: 'Earned over 1000 Green Credits.' },
    TOP_CONTRIBUTOR: { id: 'top_contributor', name: 'Top Contributor', icon: '🌟', description: 'Ranked in the top 10 on the monthly leaderboard.' }
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
    static async checkMilestones(userId: string, reportCount: number, totalCredits: number) {
        if (reportCount >= 1) {
            await this.awardBadge(userId, BADGES.FIRST_REPORT.id);
        }
        if (reportCount >= 5) {
            await this.awardBadge(userId, BADGES.CIVIC_GUARDIAN.id);
        }
        if (totalCredits >= 1000) {
            await this.awardBadge(userId, BADGES.CENTURION.id);
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
