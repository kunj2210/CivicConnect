import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env (up two levels from src/scripts)
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Department, Ward, connectPostgres } from '../config/db.js';

async function main() {
    await connectPostgres();
    const depts = await Department.findAll({attributes: ['id', 'name']});
    const wards = await Ward.findAll({attributes: ['id', 'name']});
    
    console.log('---START_DATA---');
    console.log(JSON.stringify({ depts, wards }, null, 2));
    console.log('---END_DATA---');
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
