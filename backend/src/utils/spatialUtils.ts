import { sequelize } from '../config/db.js';
import { QueryTypes } from 'sequelize';

/**
 * Finds the ward_id for a given longitude and latitude using PostGIS.
 */
export async function findWardId(longitude: number, latitude: number): Promise<string | null> {
    try {
        const result: any = await sequelize.query(`
            SELECT id FROM wards 
            WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326))
            LIMIT 1
        `, {
            replacements: { lon: longitude, lat: latitude },
            type: QueryTypes.SELECT
        });
        return result[0]?.id || null;
    } catch (error) {
        console.error('Error finding ward:', error);
        return null;
    }
}
