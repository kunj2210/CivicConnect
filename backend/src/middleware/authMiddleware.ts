import type { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';

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

        // Fetch linked user from PostgreSQL to get the most up-to-date role with its database-driven roles and permissions
        const { User, Role, Permission } = await import('../config/db.js');
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
            },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    include: [{ model: Permission, as: 'permissions' }]
                }
            ]
        });

        console.log(`[AuthMiddleware] LOOKUP: found=${!!dbUser}, db_id=${dbUser?.id}, db_email=${dbUser?.email}, roles_count=${dbUser?.roles?.length || 0}`);

        // Self-healing / migrating legacy users who don't have roles in user_roles table
        if (dbUser && (!dbUser.roles || dbUser.roles.length === 0)) {
            let roleName = dbUser.role || 'citizen';
            if (roleName === 'staff') roleName = 'field_officer';
            else if (roleName === 'authority') roleName = 'dept_head';
            
            console.log(`[AuthMiddleware] Self-healing user_roles mapping for user ${supId} to role ${roleName}`);
            const dbRole = await Role.findOne({ where: { name: roleName } });
            if (dbRole) {
                const { UserRole } = await import('../config/db.js');
                await UserRole.findOrCreate({
                    where: { user_id: supId, role_id: dbRole.id }
                });
                
                // Refetch
                dbUser = await User.findOne({
                    where: { id: dbUser.id },
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            include: [{ model: Permission, as: 'permissions' }]
                        }
                    ]
                });
            }
        }

        // JIT Provisioning: If authenticated in Supabase but missing in PG, create it
        if (!dbUser) {
            console.log(`[AuthMiddleware] JIT TRIGGERED for ident=${identifier}`);
            try {
                let rawRole = (user.user_metadata?.role || 'citizen').toLowerCase().replace(' ', '_');
                
                // Map common variants
                let mappedRole = 'citizen';
                if (['admin', 'super_admin'].includes(rawRole)) mappedRole = 'admin';
                else if (rawRole === 'staff') mappedRole = 'field_officer';
                else if (rawRole === 'authority') mappedRole = 'dept_head';
                else if (rawRole === 'hq_staff') mappedRole = 'hq_staff';
                else if (rawRole === 'viewer') mappedRole = 'viewer';
                
                console.log(`[AuthMiddleware] Attempting User.create with ID: ${supId}, mappedRole: ${mappedRole}`);
                dbUser = await User.create({
                    id: supId, 
                    phone: user.phone || null,
                    email: user.email || null,
                    role: mappedRole
                });

                // Link role in UserRole
                const dbRole = await Role.findOne({ where: { name: mappedRole } });
                if (dbRole) {
                    const { UserRole } = await import('../config/db.js');
                    await UserRole.create({
                        user_id: supId,
                        role_id: dbRole.id
                    });
                }

                // Refetch with associations
                dbUser = await User.findOne({
                    where: { id: supId },
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            include: [{ model: Permission, as: 'permissions' }]
                        }
                    ]
                });
                
                // Persistent log for environment-agnostic tracing
                const fs = await import('fs');
                fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] SUCCESS: id=${supId}, email=${user.email}, role=${mappedRole}\n`);
                console.log(`[AuthMiddleware] JIT SUCCESS: new_id=${dbUser?.id}, role=${mappedRole}`);
            } catch (createErr: any) {
                const fs = await import('fs');
                fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] FAILURE: id=${supId}, email=${user.email}, err=${createErr.message}\n`);
                console.error(`[AuthMiddleware] JIT CRITICAL FAILURE: ${createErr.message}`);
            }
        }

        // Check for role upgrade: viewer -> citizen upon mobile verification
        const hasViewerRole = dbUser?.roles?.some((r: any) => r.name === 'viewer');
        if (dbUser && hasViewerRole && dbUser.phone) {
            console.log(`[AuthMiddleware] Upgrading user ${supId} from viewer to citizen due to phone verification.`);
            const citizenRole = await Role.findOne({ where: { name: 'citizen' } });
            const viewerRole = await Role.findOne({ where: { name: 'viewer' } });
            if (citizenRole && viewerRole) {
                const { UserRole } = await import('../config/db.js');
                // Remove viewer role
                await UserRole.destroy({ where: { user_id: supId, role_id: viewerRole.id } });
                // Add citizen role
                await UserRole.findOrCreate({ where: { user_id: supId, role_id: citizenRole.id } });
                
                // Update User.role legacy field
                dbUser.role = 'citizen';
                await dbUser.save();
                
                // Refetch
                dbUser = await User.findOne({
                    where: { id: supId },
                    include: [
                        {
                            model: Role,
                            as: 'roles',
                            include: [{ model: Permission, as: 'permissions' }]
                        }
                    ]
                });
            }
        }

        // Attach user info and permissions list to request
        const attachedPermissions = dbUser?.roles?.flatMap((r: any) => (r.permissions || []).map((p: any) => p.key)) || [];
        const userRoleName = dbUser?.roles?.[0]?.name || dbUser?.role || 'citizen';
        
        (req as any).user = {
            ...user,
            role: userRoleName,
            permissions: attachedPermissions,
            department_id: dbUser?.department_id,
            ward_id: dbUser?.ward_id
        };
        
        // Consistent identifier logic
        (req as any).userIdentifier = identifier || supId;

        // If user exists in PG, check if Supabase metadata role is out of sync or missing
        if (dbUser && userRoleName !== user.user_metadata?.role) {
            console.log(`[AuthMiddleware] Syncing PostgreSQL role '${userRoleName}' to Supabase metadata for user ${supId}`);
            supabaseAdmin.auth.admin.updateUserById(supId, {
                user_metadata: {
                    ...user.user_metadata,
                    role: userRoleName
                }
            }).catch(err => {
                console.error(`[AuthMiddleware] Failed to sync role to Supabase: ${err.message}`);
            });
        }

        next();
    } catch (error: any) {
        console.error('[AuthMiddleware] Internal Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};
