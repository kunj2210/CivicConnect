
import { User } from './src/config/db.js';

async function check() {
    try {
        const users = await User.findAll();
        console.log('--- USERS TABLE ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Phone: ${u.phone}, Email: ${u.email}, Role: ${u.role}`);
        });
        console.log('-------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
