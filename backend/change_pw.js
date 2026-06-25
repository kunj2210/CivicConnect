import { supabaseAdmin } from './dist/config/supabase.js';

async function run() {
    try {
        const email = 'mgkuvadiya28@gmail.com';
        console.log(`[ADMIN] Fetching user by email: ${email}...`);
        
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;
        
        const user = users.find(u => u.email === email);
        if (!user) {
            console.error(`[ADMIN ERROR] User ${email} not found in Supabase Auth.`);
            process.exit(1);
        }
        
        console.log(`[ADMIN] User found. ID: ${user.id}. Setting password to "password123"...`);
        const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: 'password123'
        });
        
        if (updateError) throw updateError;
        console.log(`✅ [ADMIN SUCCESS] Password updated for ${email}.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ [ADMIN ERROR] Error updating password:', err);
        process.exit(1);
    }
}

run();
