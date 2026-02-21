import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';
export class RoutingService {
    /**
     * Determine which Urban Local Body (ULB) holds jurisdiction over the coordinates.
     * This uses a mock boundary check for now, but will use PostGIS ST_Contains in production.
     */
    static async identifyJurisdiction(latitude, longitude) {
        try {
            // PROD logic using PostGIS
            const [result] = await sequelize.query('SELECT name FROM ulb_boundaries WHERE ST_Contains(geom, ST_SetSRID(ST_Point(:lon, :lat), 4326)) LIMIT 1', { replacements: { lat: latitude, lon: longitude }, type: QueryTypes.SELECT });
            if (result && result.name) {
                return result.name;
            }
            // Fallback for demo if no boundary is matched
            return "Municipal Corporation of Delhi (MCD)";
        }
        catch (error) {
            console.error('Jurisdiction identification error (ensure ulb_boundaries table exists):', error);
            return "Municipal Corporation of Delhi (MCD)";
        }
    }
}
//# sourceMappingURL=routingService.js.map