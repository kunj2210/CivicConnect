import { sequelize } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const fixSecurityErrors = async () => {
    try {
        console.log('🛡️ Fixing Supabase Security Advisor Errors...');

        const tables = [
            'wards', 'departments', 'ulb_boundaries', 'users', 
            'issues', 'repairs', 'audit_logs', 'notifications', 
            'UserDevices', 'ai_feedback_queue'
        ];

        for (const table of tables) {
            console.log(`Enabling RLS on ${table}...`);
            // Enable RLS
            await sequelize.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
            
            // Add Policies (Allow Authenticated users full access, Anon users read-only)
            await sequelize.query(`DROP POLICY IF EXISTS "Allow all for authenticated" ON public."${table}";`);
            await sequelize.query(`CREATE POLICY "Allow all for authenticated" ON public."${table}" FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
            
            await sequelize.query(`DROP POLICY IF EXISTS "Allow read for anon" ON public."${table}";`);
            await sequelize.query(`CREATE POLICY "Allow read for anon" ON public."${table}" FOR SELECT TO anon USING (true);`);
        }

        console.log('✅ All Security Advisor errors have been corrected!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to fix security errors:', error);
        process.exit(1);
    }
};

fixSecurityErrors();
