import { User, Role, UserRole, Permission } from '../config/db.js';
import { Op } from 'sequelize';
import fs from 'fs';
import { supabaseAdmin } from '../config/supabase.js';

export const syncUserFromDatabase = async (supabaseUser: any) => {
    const identifier = supabaseUser.phone || supabaseUser.email;
    const supId = supabaseUser.id;

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

    // Self-healing / migrating legacy users who don't have roles in user_roles table
    if (dbUser && (!dbUser.roles || dbUser.roles.length === 0)) {
        let roleName = dbUser.role || 'citizen';
        if (roleName === 'staff') roleName = 'field_officer';
        else if (roleName === 'authority') roleName = 'dept_head';
        
        const dbRole = await Role.findOne({ where: { name: roleName } });
        if (dbRole) {
            await UserRole.findOrCreate({
                where: { user_id: supId, role_id: dbRole.id }
            });
            
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

    // JIT Provisioning
    if (!dbUser) {
        try {
            let rawRole = (supabaseUser.user_metadata?.role || 'citizen').toLowerCase().replace(' ', '_');
            
            let mappedRole = 'viewer'; // Default to viewer for unverified phone accounts
            if (['admin', 'super_admin'].includes(rawRole)) mappedRole = 'admin';
            else if (rawRole === 'staff') mappedRole = 'field_officer';
            else if (rawRole === 'authority') mappedRole = 'dept_head';
            else if (rawRole === 'hq_staff') mappedRole = 'hq_staff';
            else if (rawRole === 'viewer') mappedRole = 'viewer';
            else if (rawRole === 'citizen' && supabaseUser.phone) mappedRole = 'citizen';
            
            dbUser = await User.create({
                id: supId, 
                phone: supabaseUser.phone || null,
                email: supabaseUser.email || null,
                role: mappedRole
            });

            const dbRole = await Role.findOne({ where: { name: mappedRole } });
            if (dbRole) {
                await UserRole.create({
                    user_id: supId,
                    role_id: dbRole.id
                });
            }

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
            
            fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] SUCCESS: id=${supId}, email=${supabaseUser.email}, role=${mappedRole}\n`);
        } catch (createErr: any) {
            fs.appendFileSync('jit_sync.log', `[${new Date().toISOString()}] FAILURE: id=${supId}, email=${supabaseUser.email}, err=${createErr.message}\n`);
            console.error(`[AuthUtils] JIT CRITICAL FAILURE: ${createErr.message}`);
        }
    }

    // Sync phone and email to database if they changed in Supabase
    if (dbUser) {
        let needsSave = false;
        if (supabaseUser.phone && dbUser.phone !== supabaseUser.phone) {
            dbUser.phone = supabaseUser.phone;
            needsSave = true;
        }
        if (supabaseUser.email && dbUser.email !== supabaseUser.email) {
            dbUser.email = supabaseUser.email;
            needsSave = true;
        }
        if (needsSave) {
            await dbUser.save();
        }
    }

    // Check for role upgrade
    const hasViewerRole = dbUser?.roles?.some((r: any) => r.name === 'viewer');
    if (dbUser && hasViewerRole && dbUser.phone) {
        const citizenRole = await Role.findOne({ where: { name: 'citizen' } });
        const viewerRole = await Role.findOne({ where: { name: 'viewer' } });
        if (citizenRole && viewerRole) {
            await UserRole.destroy({ where: { user_id: supId, role_id: viewerRole.id } });
            await UserRole.findOrCreate({ where: { user_id: supId, role_id: citizenRole.id } });
            
            dbUser.role = 'citizen';
            await dbUser.save();
            
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

    const attachedPermissions = dbUser?.roles?.flatMap((r: any) => (r.permissions || []).map((p: any) => p.key)) || [];
    const userRoleName = dbUser?.roles?.[0]?.name || dbUser?.role || 'citizen';

    if (dbUser && userRoleName !== supabaseUser.user_metadata?.role) {
        supabaseAdmin.auth.admin.updateUserById(supId, {
            user_metadata: {
                ...supabaseUser.user_metadata,
                role: userRoleName
            }
        }).catch(err => {
            console.error(`[AuthUtils] Failed to sync role to Supabase: ${err.message}`);
        });
    }

    return { dbUser, userRoleName, attachedPermissions };
};
