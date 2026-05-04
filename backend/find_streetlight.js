import { Issue } from './src/models/Issue.ts';
import { sequelize } from './src/config/db.ts';

async function findStreetLight() {
    try {
        const issues = await Issue.findAll({ 
            where: { category: 'Street Light' }
        });
        console.log(`Found ${issues.length} Street Light issues:`);
        issues.forEach(i => {
            console.log(`- ID: ${i.id}`);
            console.log(`  Pre Key: ${i.minio_pre_key}`);
            console.log(`  Image URLs: ${i.minio_image_urls}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

findStreetLight();
