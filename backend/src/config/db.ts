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

// Define Associations
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

        // Ensure PostGIS is enabled
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        console.log('PostGIS extension verified');

        // Note: Models are already initialized in their own files
        // Sync models (Safe mode)
        await sequelize.sync();
        console.log('Database tables in sync (Default mode)');

        // Targeted migration for ENUM roles (Sequelize sync doesn't handle ENUM updates)
        try {
            await sequelize.query(`
                ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'admin';
                ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'admin';
            `);
            console.log('Verified "admin" role in all possible enum types');
        } catch (enumErr) {
            console.warn('ENUM update warning (some may already exist):', (enumErr as any).message);
        }

        // Targeted migration for assigned_department_id if missing
        try {
            await sequelize.query(`
                ALTER TABLE "issues" 
                ADD COLUMN IF NOT EXISTS "assigned_department_id" UUID 
                REFERENCES "departments" ("id") ON DELETE SET NULL;
            `);
            console.log('Verified assigned_department_id column in issues table');
        } catch (colError) {
            console.error('Error ensuring assigned_department_id exists:', colError);
        }

        // Targeted migration for assigned_staff_id if missing
        try {
            await sequelize.query(`
                ALTER TABLE "issues" 
                ADD COLUMN IF NOT EXISTS "assigned_staff_id" UUID 
                REFERENCES "users" ("id") ON DELETE SET NULL;
            `);
            console.log('Verified assigned_staff_id column in issues table');
        } catch (colError) {
            console.error('Error ensuring assigned_staff_id exists:', colError);
        }


    } catch (error) {
        console.error('PostgreSQL connection error:', error);
        process.exit(1);
    }
};

export { User, Department, Ward, Issue, Repair, AuditLog, Notification, AIFeedback, UserDevice };

