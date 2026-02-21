import { UlbBoundary } from '../models/UlbBoundary.js';
import { sequelize } from '../config/db.js';

export const seedUlbBoundaries = async () => {
    try {
        console.log('--- Seeding ULB Boundaries ---');

        // Example: A rough polygon around Ranchi/Dhanbad area or Delhi
        // Let's create a big box for Delhi area as a demo fallback
        const delhiPolygon = {
            type: 'Polygon',
            coordinates: [[
                [76.8, 28.4],
                [77.4, 28.4],
                [77.4, 28.9],
                [76.8, 28.9],
                [76.8, 28.4]
            ]]
        };

        const ranchiPolygon = {
            type: 'Polygon',
            coordinates: [[
                [85.2, 23.2],
                [85.5, 23.2],
                [85.5, 23.5],
                [85.2, 23.5],
                [85.2, 23.2]
            ]]
        };

        await UlbBoundary.findOrCreate({
            where: { name: 'Municipal Corporation of Delhi (MCD)' },
            defaults: { geom: delhiPolygon }
        });

        await UlbBoundary.findOrCreate({
            where: { name: 'Ranchi Municipal Corporation' },
            defaults: { geom: ranchiPolygon }
        });

        console.log('--- ULB Seeding Success ---');
    } catch (error) {
        console.error('Error seeding ULB boundaries:', error);
    }
};
