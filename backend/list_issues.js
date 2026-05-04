import { Issue } from './src/models/Issue.ts';
import { sequelize } from './src/config/db.ts';

async function listIssues() {
    try {
        const issues = await Issue.findAll({ limit: 10 });
        console.log(`Found ${issues.length} issues:`);
        issues.forEach(i => {
            console.log(`- ID: ${i.id}, Category: ${i.category}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

listIssues();
