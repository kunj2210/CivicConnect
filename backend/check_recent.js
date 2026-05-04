import { Issue } from './src/models/Issue.ts';
import { sequelize } from './src/config/db.ts';

async function checkRecentIssues() {
    try {
        const issues = await Issue.findAll({ 
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        console.log(`Checking ${issues.length} recent issues:`);
        issues.forEach(i => {
            console.log(`- ID: ${i.id}`);
            console.log(`  Category: ${i.category}`);
            console.log(`  Minio URL: ${i.minio_pre_key}`);
            console.log(`  Created: ${i.createdAt}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkRecentIssues();
