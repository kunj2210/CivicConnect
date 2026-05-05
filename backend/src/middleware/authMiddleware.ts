import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export const verifySupabaseToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.log(`[DEBUG] verifySupabaseToken reached for path: ${req.path}`);
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];

        // Use the anon client to verify the token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('[AuthMiddleware] JWT Verification Failed:', error?.message);
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        // Fetch linked user from PostgreSQL to get the most up-to-date role
        const { User } = await import('../config/db.js');
        const { Op } = await import('sequelize');
        
        const identifier = user.phone || user.email;
        const supId = user.id;
        console.log(`[AuthMiddleware] START: ident=${identifier}, supId=${supId}, path=${req.path}`);

        let dbUser = await User.findOne({
            where: {
                [Op.or]: [
                    { phone: identifier || '___never_match___' },
                    { email: identifier || '___never_match___' },
                    { id: supId }
                ]
            }
        });

        console.log(`[AuthMiddleware] LOOKUP: found=${!!dbUser}, db_id=${dbUser?.id}, db_email=${dbUser?.email}`);

        // JIT Provisioning: If authenticated in Supabase but missing in PG, create it
        // JIT Provisioning: If authenticated in Supabase but missing in PG, create it
        if (!dbUser) {
            console.log(`[AuthMiddleware] JIT TRIGGERED for ident=${identifier}`);
            try {
                let rawRole = (user.user_metadata?.role || 'citizen').toLowerCase().replace(' ', '_');
                
                // Map common variants
                let mappedRole = 'citizen';
                if (['admin', 'super_admin'].includes(rawRole)) mappedRole = 'admin';
                else if (rawRole === 'staff') mappedRole = 'staff';
                else if (rawRole === 'authority') mappedRole = 'authority';
                
                console.log(`[AuthMiddleware] Attempting User.create with ID: ${supId}, mappedRole: ${mappedRole}`);
                dbUser = await User.create({
                    id: supId, 
                    phone: user.phone || null,
                    email: user.email || null,
                    role: mappedRole
                });
                
                // Persistent log for environment-agnostic tracing
                const fs = await import('fs');
                fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] SUCCESS: id=${supId}, email=${user.email}, role=${mappedRole}\n`);
                console.log(`[AuthMiddleware] JIT SUCCESS: new_id=${dbUser.id}, role=${mappedRole}`);
            } catch (createErr: any) {
                const fs = await import('fs');
                fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] FAILURE: id=${supId}, email=${user.email}, err=${createErr.message}\n`);
                console.error(`[AuthMiddleware] JIT CRITICAL FAILURE: ${createErr.message}`);
            }
        }

        // Attach user info to request
        (req as any).user = {
            ...user,
            role: dbUser?.role || user.user_metadata?.role || 'citizen'
        };
        
        // Consistent identifier logic
        (req as any).userIdentifier = identifier || supId;

        next();
    } catch (error: any) {
        console.error('[AuthMiddleware] Internal Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};
