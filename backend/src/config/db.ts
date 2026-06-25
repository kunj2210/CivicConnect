import dotenv from 'dotenv';
import { sequelize } from './database.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Ward } from '../models/Ward.js';
import { Issue } from '../models/Issue.js';
import { Repair } from '../models/Repair.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { AIFeedback } from '../models/AIFeedback.js';
import { UserDevice } from '../models/UserDevice.js';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permission.js';
import { RolePermission } from '../models/RolePermission.js';
import { UserRole } from '../models/UserRole.js';

// Define Associations
User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id', otherKey: 'role_id', as: 'roles' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'role_id', otherKey: 'user_id', as: 'users' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id', otherKey: 'permission_id', as: 'permissions' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permission_id', otherKey: 'role_id', as: 'roles' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'staff' });

User.belongsTo(Ward, { foreignKey: 'ward_id', as: 'ward' });
Ward.hasMany(User, { foreignKey: 'ward_id', as: 'citizens' });

Ward.belongsTo(Department, { foreignKey: 'dept_id', as: 'department' });
Department.hasMany(Ward, { foreignKey: 'dept_id', as: 'wards' });

Issue.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Issue.belongsTo(User, { foreignKey: 'assigned_staff_id', as: 'assigned_staff' });
Issue.belongsTo(Ward, { foreignKey: 'ward_id', as: 'ward' });

Repair.belongsTo(Issue, { foreignKey: 'issue_id', as: 'issue' });
Repair.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

User.hasMany(UserDevice, { foreignKey: 'user_id', as: 'devices' });
UserDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

dotenv.config();

export { sequelize };

export const connectPostgres = async () => {


    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected successfully (Sequelize)');

        // Ensure PostGIS & Vector extensions are enabled
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('PostGIS & Vector extensions verified');

        // Note: Models are already initialized in their own files
        // Sync models (Safe mode)
        await sequelize.sync();
        console.log('Database tables in sync (Default mode)');

        // Seed default roles and permissions
        try {
            console.log('Seeding roles and permissions...');
            const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
                viewer: [
                    'report:view_my',
                    'report:view_area'
                ],
                citizen: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:upvote',
                    'report:confirm_resolution',
                    'report:reject_resolution'
                ],
                field_officer: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:view_all',
                    'report:upvote',
                    'report:update_status',
                    'report:propose_resolution'
                ],
                hq_staff: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:view_all',
                    'report:upvote',
                    'report:assign',
                    'report:update_status',
                    'report:propose_resolution',
                    'report:bulk_update',
                    'ai:manage'
                ],
                dept_head: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:view_all',
                    'report:upvote',
                    'report:assign',
                    'report:update_status',
                    'report:propose_resolution',
                    'report:confirm_resolution',
                    'report:reject_resolution',
                    'report:bulk_update',
                    'analytics:query'
                ],
                admin: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:view_all',
                    'report:upvote',
                    'report:assign',
                    'report:update_status',
                    'report:propose_resolution',
                    'report:confirm_resolution',
                    'report:reject_resolution',
                    'report:bulk_update',
                    'report:delete',
                    'analytics:query',
                    'ai:manage',
                    'users:manage',
                    'audit:view'
                ],
                super_admin: [
                    'report:create',
                    'report:view_my',
                    'report:view_area',
                    'report:view_all',
                    'report:upvote',
                    'report:assign',
                    'report:update_status',
                    'report:propose_resolution',
                    'report:confirm_resolution',
                    'report:reject_resolution',
                    'report:bulk_update',
                    'report:delete',
                    'analytics:query',
                    'ai:manage',
                    'users:manage',
                    'audit:view'
                ]
            };

            // Seed unique permissions
            const allPermissionKeys = Array.from(
                new Set(Object.values(DEFAULT_ROLE_PERMISSIONS).flat())
            );

            const permissionInstances: Record<string, any> = {};
            for (const key of allPermissionKeys) {
                const [permission] = await Permission.findOrCreate({
                    where: { key }
                });
                permissionInstances[key] = permission;
            }

            // Seed roles and link them
            for (const [roleName, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
                const [role] = await Role.findOrCreate({
                    where: { name: roleName }
                });

                // Get permission IDs
                const pIds = permissionKeys.map(k => permissionInstances[k].id);

                // Set association
                await (role as any).setPermissions(pIds);
            }
            console.log('Roles and permissions seeded successfully');
        } catch (seedErr: any) {
            console.error('Error seeding roles and permissions:', seedErr.message);
        }

        try {
            await sequelize.query(`
                ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
                ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "audio_text" TEXT;
                ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "assigned_department_id" UUID REFERENCES "departments" ("id") ON DELETE SET NULL;
                ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "assigned_staff_id" UUID REFERENCES "users" ("id") ON DELETE SET NULL;
            `);
            console.log('Targeted migrations (vector, audio_text & foreign keys) executed successfully');
        } catch (migErr) {
            console.warn('Migration warning:', (migErr as any).message);
        }

        // Targeted migration for ENUM roles
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'admin';`);
        } catch (enumErr) {}
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'hq_staff';`);
        } catch (enumErr) {}
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'viewer';`);
        } catch (enumErr) {}
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'field_officer';`);
        } catch (enumErr) {}
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'dept_head';`);
        } catch (enumErr) {}


    } catch (error) {
        console.error('PostgreSQL connection error:', error);
        process.exit(1);
    }
};

export { User, Department, Ward, Issue, Repair, AuditLog, Notification, AIFeedback, UserDevice, Role, Permission, RolePermission, UserRole };

