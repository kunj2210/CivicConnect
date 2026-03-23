import { sequelize } from './config/db.js';

async function applyRLS() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        
        console.log('Applying Row Level Security (RLS) policies...');

        const sql = `
            -- Enable Row Level Security
            ALTER TABLE "issues" ENABLE ROW LEVEL SECURITY;
            ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

            -- Drop existing policies if any
            DROP POLICY IF EXISTS "Authorities can only view and alter issues in their assigned ward" ON "issues";
            DROP POLICY IF EXISTS "Staff can only view and alter their assigned issues" ON "issues";
            DROP POLICY IF EXISTS "Super admins and admins have full access to issues" ON "issues";
            DROP POLICY IF EXISTS "Citizens have access to their own issues" ON "issues";

            DROP POLICY IF EXISTS "Authorities can view users in their assigned ward" ON "users";
            DROP POLICY IF EXISTS "Super admins and admins have full access to users" ON "users";
            DROP POLICY IF EXISTS "Users can access their own profile" ON "users";

            -- Issues Policies
            CREATE POLICY "Authorities can view issues in their assigned ward" 
            ON "issues" FOR SELECT 
            USING (
                ward_id = (SELECT ward_id FROM users WHERE id = auth.uid() AND role = 'authority' LIMIT 1)
            );

            CREATE POLICY "Authorities can update issues in their assigned ward" 
            ON "issues" FOR UPDATE 
            USING (
                ward_id = (SELECT ward_id FROM users WHERE id = auth.uid() AND role = 'authority' LIMIT 1)
            );

            CREATE POLICY "Staff can view their assigned issues" 
            ON "issues" FOR SELECT 
            USING (
                assigned_staff_id = auth.uid()
            );

            CREATE POLICY "Staff can update their assigned issues" 
            ON "issues" FOR UPDATE 
            USING (
                assigned_staff_id = auth.uid()
            );

            CREATE POLICY "Super admins and admins have full access to issues" 
            ON "issues" FOR ALL 
            USING (
                (SELECT role FROM users WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
            );

            CREATE POLICY "Citizens can access their own issues" 
            ON "issues" FOR ALL 
            USING (
                auth.uid() = reporter_id OR auth.uid() = ANY(reporter_ids)
            );

            -- Users Policies
            CREATE POLICY "Users can access their own profile" 
            ON "users" FOR ALL 
            USING (
                auth.uid() = id
            );

            CREATE POLICY "Super admins and admins have full access to users" 
            ON "users" FOR ALL 
            USING (
                auth.uid() IN (
                    SELECT id FROM users WHERE role IN ('admin', 'super_admin')
                )
            );

            CREATE POLICY "Authorities can view users in their assigned ward" 
            ON "users" FOR ALL 
            USING (
                ward_id = (SELECT ward_id FROM users WHERE id = auth.uid() AND role = 'authority' LIMIT 1)
            );
        `;

        await sequelize.query(sql);
        console.log('✅ RLS Policies successfully applied to issues and users tables.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error applying RLS policies:', error);
        process.exit(1);
    }
}

applyRLS();
