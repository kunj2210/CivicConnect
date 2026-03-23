import { sequelize, User } from '../config/db.js';
import { QueryTypes } from 'sequelize';
import { sendNotificationToUser } from './notificationService.js';

export class GeoIntelligenceService {
    /**
     * Identifies all citizens whose 'Personal Safety Zone' (Home Location + Alert Radius)
     * covers the newly reported issue and sends them a proactive alert.
     */
    static async notifyNearbyCitizens(issueId: string, category: string, lat: number, lon: number, reporterId: string) {
        try {
            // PostGIS query to find users whose home_location is within their defined radius of the issue
            const nearbyUsers: any = await sequelize.query(`
                SELECT id, phone, alert_radius_meters FROM users
                WHERE role = 'citizen'
                AND id != :reporterId
                AND home_location IS NOT NULL
                AND ST_DWithin(
                    home_location::geography, 
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
                    alert_radius_meters
                )
            `, {
                replacements: { lon, lat, reporterId },
                type: QueryTypes.SELECT
            });

            console.log(`[GEO-INTELLIGENCE] Found ${nearbyUsers.length} citizens in range of ${category} at ${lat}, ${lon}.`);

            // Proactive Alert Dispatch
            for (const neighbor of nearbyUsers) {
                await sendNotificationToUser(
                    neighbor.id,
                    'Neighborhood Alert',
                    `A new ${category} has been reported near your residence. Track its resolution in the app.`,
                    { issue_id: issueId, type: 'PROACTIVE_NEIGHBOR_ALERT' }
                );
            }

            return nearbyUsers.length;
        } catch (error) {
            console.error('Geo-Intelligence Notification Error:', error);
            return 0;
        }
    }
}
