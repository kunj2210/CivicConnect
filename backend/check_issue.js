import { Issue } from './src/models/Issue.ts';
import { sequelize } from './src/config/db.ts';

async function checkIssue() {
    try {
        const id = 'a9c60232-2909-4b43-8140-2f778c9a41dd';
        const issue = await Issue.findByPk(id);
        if (!issue) {
            console.log('Issue not found');
        } else {
            console.log('ISSUE DATA:');
            console.log('Category:', issue.category);
            console.log('Minio Pre Key:', issue.minio_pre_key);
            console.log('Minio Image URLs:', issue.minio_image_urls);
            console.log('AI Image Top 3:', JSON.stringify(issue.ai_image_top3, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkIssue();
