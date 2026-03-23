import { User } from './models/User.js';
import dotenv from 'dotenv';
import { supabaseAdmin } from './config/supabase.js';

dotenv.config();

const seedUsers = async () => {
    try {
        console.log('Starting seed process for Supabase and PostgreSQL...');

        // Clear existing local user records in PG
        await User.destroy({ where: {}, truncate: true, cascade: true });

        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@civicconnect.gov',
                password: 'admin123',
                role: 'Admin',
                phone: '+910000000001'
            },
            {
                name: 'Authority User',
                email: 'authority@civicconnect.gov',
                password: 'auth123',
                role: 'Authority',
                phone: '+910000000002'
            }
        ];

        for (const userData of testUsers) {
            console.log(`Processing user: ${userData.email}`);
            
            // 1. Create/Update in Supabase Auth
            const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: { role: userData.role, name: userData.name }
            });

            let authId = user?.id;

            if (error && error.message.includes('already registered')) {
                console.log(`User ${userData.email} already exists in Supabase Auth. Fetching ID...`);
                const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
                authId = existingUser.users.find(u => u.email === userData.email)?.id;
            } else if (error) {
                console.error(`Error creating user ${userData.email} in Supabase:`, error.message);
                continue;
            } else {
                console.log(`User ${userData.email} created in Supabase Auth.`);
            }

            // 2. Sync to public.users table in PostgreSQL
            if (authId) {
                await User.upsert({
                    id: authId,
                    phone: userData.phone,
                    green_credits: 100
                });
                console.log(`User ${userData.email} synced to PostgreSQL.`);
            }
        }

        console.log('Successfully seeded Admin and Authority users.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();


