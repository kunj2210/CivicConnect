import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
    console.error('CRITICAL: Supabase environment variables are missing!');
}

// Service Role client for backend administrative tasks (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Anon client for public/client-impersonation tasks if needed
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase initialized successfully');
