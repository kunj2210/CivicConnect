import { UlbBoundary } from '../models/UlbBoundary.js';
import { Ward } from '../models/Ward.js';
import { Department } from '../models/Department.js';
import { sequelize } from '../config/db.js';

export const seedUlbBoundaries = async () => {
    try {
        console.log('--- Seeding ULB Boundaries & Wards ---');

        // 1. Ensure a default Department exists
        const [defaultDept] = await Department.findOrCreate({
            where: { name: 'Public Works Department' },
            defaults: { contact_email: 'pwd@city.gov' }
        });

        // 2. Define Boundaries
        const delhiCoords = [
            [76.8, 28.4], [77.4, 28.4], [77.4, 28.9], [76.8, 28.9], [76.8, 28.4]
        ];
        const ranchiCoords = [
            [85.2, 23.2], [85.5, 23.2], [85.5, 23.5], [85.2, 23.5], [85.2, 23.2]
        ];
        const mumbaiCoords = [
            [72.7, 18.8], [73.0, 18.8], [73.0, 19.3], [72.7, 19.3], [72.7, 18.8]
        ];

        const sandboxCoords = [
            [72.8, 22.4], [73.2, 22.4], [73.2, 22.8], [72.8, 22.8], [72.8, 22.4]
        ];

        const regions = [
            { name: 'Municipal Corporation of Delhi (MCD)', coords: delhiCoords, wardName: 'Ward 01 - Delhi Central' },
            { name: 'Ranchi Municipal Corporation', coords: ranchiCoords, wardName: 'Ward A-1 - Ranchi Main' },
            { name: 'Brihanmumbai Municipal Corporation (BMC)', coords: mumbaiCoords, wardName: 'Ward K/West - Mumbai' },
            { name: 'Development Sandbox', coords: sandboxCoords, wardName: 'Dev Ward - User Location' }
        ];


        for (const region of regions) {
            const polygon = {
                type: 'Polygon',
                coordinates: [region.coords]
            };

            // Seed ULB
            await UlbBoundary.findOrCreate({
                where: { name: region.name },
                defaults: { geom: { type: 'MultiPolygon', coordinates: [[region.coords]] } }
            });

            // Seed Ward (Required for findWardId logic)
            await Ward.findOrCreate({
                where: { name: region.wardName },
                defaults: { 
                    boundary: polygon,
                    dept_id: defaultDept.id
                }
            });
        }

        console.log('--- ULB & Ward Seeding Success ---');
    } catch (error) {
        console.error('Error seeding ULB boundaries:', error);
    }
};

