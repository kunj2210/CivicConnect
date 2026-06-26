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
import { ProcessingJob } from '../models/ProcessingJob.js';
import { UlbBoundary } from '../models/UlbBoundary.js';

// Define Associations
ProcessingJob.belongsTo(Issue, { foreignKey: 'issue_id', as: 'issue' });
Issue.hasMany(ProcessingJob, { foreignKey: 'issue_id', as: 'processing_jobs' });

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

User.belongsTo(UlbBoundary, { foreignKey: 'ulb_id', as: 'ulb' });
UlbBoundary.hasMany(User, { foreignKey: 'ulb_id', as: 'users' });

Ward.belongsTo(UlbBoundary, { foreignKey: 'ulb_id', as: 'ulb' });
UlbBoundary.hasMany(Ward, { foreignKey: 'ulb_id', as: 'wards' });

Department.belongsTo(UlbBoundary, { foreignKey: 'ulb_id', as: 'ulb' });
UlbBoundary.hasMany(Department, { foreignKey: 'ulb_id', as: 'departments' });

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

        // Drop incompatible foreign key constraint if it exists to allow 'SYSTEM' as actor_id string
        try {
            await sequelize.query('ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_actor_id_fkey";');
        } catch (e) {}

        // Note: Models are already initialized in their own files
        // Sync models with alter to support dynamic changes
        await sequelize.sync({ alter: true });
        console.log('Database tables in sync (Alter mode)');

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
                ],
                mayor: [
                    'report:view_all',
                    'analytics:query',
                    'audit:view'
                ],
                councilor: [
                    'report:view_area',
                    'analytics:query'
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

                -- Create processing_jobs table
                CREATE TABLE IF NOT EXISTS "processing_jobs" (
                  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  "issue_id"        UUID REFERENCES issues(id) ON DELETE CASCADE,
                  "image_s3_key"    TEXT,
                  "image_get_url"   TEXT,
                  "audio_s3_key"    TEXT,
                  "audio_get_url"   TEXT,
                  "description"     TEXT,
                  "latitude"        NUMERIC(9,6) NOT NULL,
                  "longitude"       NUMERIC(9,6) NOT NULL,
                  "reporter_id"     UUID NOT NULL,
                  "ward_id"         UUID NOT NULL,
                  "status"          TEXT DEFAULT 'pending',
                  "attempts"        INT DEFAULT 0,
                  "result"          JSONB,
                  "error"           TEXT,
                  "createdAt"       TIMESTAMPTZ DEFAULT NOW(),
                  "updatedAt"       TIMESTAMPTZ DEFAULT NOW()
                );

                -- SQL RPC Function to process AI Results
                CREATE OR REPLACE FUNCTION process_issue_ai_results(
                  p_job_id UUID,
                  p_ai_result JSONB
                ) RETURNS JSONB AS $$
                DECLARE
                  v_issue_id UUID;
                  v_image_s3_key TEXT;
                  v_image_get_url TEXT;
                  v_audio_s3_key TEXT;
                  v_audio_get_url TEXT;
                  v_description TEXT;
                  v_lat NUMERIC(9,6);
                  v_lon NUMERIC(9,6);
                  v_reporter_id UUID;
                  v_ward_id UUID;
                  
                  v_final_category TEXT;
                  v_fusion_score NUMERIC;
                  v_needs_human_review BOOLEAN;
                  v_image_top3 JSONB;
                  v_audio_top3 JSONB;
                  v_text_top3 JSONB;
                  v_audio_text TEXT;
                  
                  v_mapped_category TEXT;
                  v_duplicate_id UUID;
                  v_assigned_dept_id UUID;
                  v_assigned_staff_id UUID;
                  v_priority_score NUMERIC;
                  
                  v_current_reporters UUID[];
                  v_current_images TEXT[];
                  v_current_audios TEXT[];
                  v_base_priority NUMERIC;
                  v_new_priority NUMERIC;
                  
                  v_user_credits INT;
                  v_spatial_density INT;
                  v_nearby_count INT;
                  v_ai_status TEXT;
                  
                  v_response JSONB;
                BEGIN
                  -- 1. Get Job details
                  SELECT issue_id, image_s3_key, image_get_url, audio_s3_key, audio_get_url, description, latitude, longitude, reporter_id, ward_id
                  INTO v_issue_id, v_image_s3_key, v_image_get_url, v_audio_s3_key, v_audio_get_url, v_description, v_lat, v_lon, v_reporter_id, v_ward_id
                  FROM processing_jobs
                  WHERE id = p_job_id;
                  
                  IF NOT FOUND THEN
                    RAISE EXCEPTION 'Job not found';
                  END IF;
                  
                  -- 2. Parse AI Results
                  v_final_category := p_ai_result->>'finalCategory';
                  v_fusion_score := (p_ai_result->>'fusionScore')::NUMERIC;
                  v_needs_human_review := (p_ai_result->>'needsHumanReview')::BOOLEAN;
                  v_image_top3 := p_ai_result->'imageTop3';
                  v_audio_top3 := p_ai_result->'audioTop3';
                  v_text_top3 := p_ai_result->'textTop3';
                  v_audio_text := p_ai_result->>'audioText';
                  
                  -- 3. Mapped Category
                  v_mapped_category := CASE
                    WHEN LOWER(v_final_category) IN ('garbage_overflow_west_container', 'construction_waste', 'dead_animal') THEN 'Waste Management'
                    WHEN LOWER(v_final_category) IN ('pothole_road_crack', 'damaged_sidewalk', 'damaged_sign') THEN 'Road/Potholes'
                    WHEN LOWER(v_final_category) IN ('streetlight_damage', 'traffic_light', 'powerline_damage') THEN 'Street Light'
                    WHEN LOWER(v_final_category) IN ('flooding_waterlogging', 'open_manhole') THEN 'Water Leakage'
                    ELSE 'Other'
                  END;

                  -- 4. Check for duplicates (PostGIS ST_DWithin) using category-specific radius
                  SELECT id INTO v_duplicate_id
                  FROM issues
                  WHERE id != v_issue_id
                  AND category = v_mapped_category
                  AND status != 'Resolved'
                  AND ST_DWithin(
                    location::geography, 
                    ST_SetSRID(ST_MakePoint(v_lon, v_lat), 4326)::geography,
                    CASE 
                      WHEN LOWER(v_final_category) = 'pothole_road_crack' THEN 10
                      WHEN LOWER(v_final_category) = 'flooding_waterlogging' THEN 50
                      WHEN LOWER(v_final_category) = 'garbage_overflow_west_container' THEN 20
                      WHEN LOWER(v_final_category) = 'open_manhole' THEN 10
                      WHEN LOWER(v_final_category) = 'construction_waste' THEN 30
                      ELSE 25
                    END
                  )
                  ORDER BY "createdAt" DESC
                  LIMIT 1;

                  IF v_duplicate_id IS NOT NULL AND v_duplicate_id != v_issue_id THEN
                    -- A duplicate was found! Merge evidence.
                    SELECT reporter_ids, minio_image_urls, minio_audio_urls, priority_score
                    INTO v_current_reporters, v_current_images, v_current_audios, v_base_priority
                    FROM issues WHERE id = v_duplicate_id;
                    
                    -- Append reporter if not exists
                    IF NOT (v_reporter_id = ANY(v_current_reporters)) THEN
                      v_current_reporters := array_append(v_current_reporters, v_reporter_id);
                    END IF;
                    
                    -- Append S3 Urls
                    IF v_image_get_url IS NOT NULL AND v_image_get_url != '' THEN
                      v_current_images := array_append(v_current_images, v_image_get_url);
                    END IF;
                    IF v_audio_get_url IS NOT NULL AND v_audio_get_url != '' THEN
                      v_current_audios := array_append(v_current_audios, v_audio_get_url);
                    END IF;
                    
                    -- Boost priority
                    v_new_priority := LEAST(v_base_priority + 5, 100);
                    
                    -- Update existing duplicate issue
                    UPDATE issues SET
                      reporter_ids = v_current_reporters,
                      minio_image_urls = v_current_images,
                      minio_audio_urls = v_current_audios,
                      priority_score = v_new_priority,
                      "updatedAt" = NOW()
                    WHERE id = v_duplicate_id;
                    
                    -- Update processing_job reference and status
                    UPDATE processing_jobs SET
                      issue_id = v_duplicate_id,
                      status = 'done',
                      result = p_ai_result,
                      "updatedAt" = NOW()
                    WHERE id = p_job_id;
                    
                    -- Delete the temporary issue that was created
                    DELETE FROM issues WHERE id = v_issue_id;
                    
                    v_response := jsonb_build_object(
                      'status', 'done',
                      'issue_id', v_duplicate_id,
                      'is_duplicate', true
                    );
                  ELSE
                    -- No duplicate found. Process this issue.
                    -- A. Resolve department ID
                    SELECT id INTO v_assigned_dept_id
                    FROM departments
                    WHERE name = CASE
                      WHEN LOWER(v_final_category) LIKE '%pothole%' OR LOWER(v_final_category) LIKE '%road%' THEN 'Infrastructure Solutions'
                      WHEN LOWER(v_final_category) LIKE '%waste%' OR LOWER(v_final_category) LIKE '%garbage%' THEN 'Environmental Services'
                      WHEN LOWER(v_final_category) LIKE '%light%' OR LOWER(v_final_category) LIKE '%electrical%' THEN 'Electrical Utilities'
                      WHEN LOWER(v_final_category) LIKE '%water%' OR LOWER(v_final_category) LIKE '%drainage%' OR LOWER(v_final_category) LIKE '%sewage%' THEN 'Water & Sewage Management'
                      WHEN LOWER(v_final_category) LIKE '%encroachment%' THEN 'Public Works Department'
                      WHEN LOWER(v_final_category) LIKE '%criminal%' OR LOWER(v_final_category) LIKE '%vandalism%' THEN 'Public Safety & Security'
                      ELSE 'Public Works Department'
                    END;
                    
                    IF v_assigned_dept_id IS NULL THEN
                      SELECT id INTO v_assigned_dept_id FROM departments WHERE name = 'Public Works Department' LIMIT 1;
                    END IF;

                    -- B. Find best staff
                    SELECT u.id INTO v_assigned_staff_id
                    FROM users u
                    LEFT JOIN issues i ON i.assigned_staff_id = u.id AND i.status NOT IN ('Resolved', 'Closed')
                    WHERE u.role = 'staff'
                    AND u.department_id = v_assigned_dept_id
                    AND u.is_active = true
                    AND u.ward_id = v_ward_id
                    GROUP BY u.id
                    ORDER BY COUNT(i.id) ASC
                    LIMIT 1;
                    
                    IF v_assigned_staff_id IS NULL THEN
                      -- Broaden search to entire department (not restricted to ward)
                      SELECT u.id INTO v_assigned_staff_id
                      FROM users u
                      LEFT JOIN issues i ON i.assigned_staff_id = u.id AND i.status NOT IN ('Resolved', 'Closed')
                      WHERE u.role = 'staff'
                      AND u.department_id = v_assigned_dept_id
                      AND u.is_active = true
                      GROUP BY u.id
                      ORDER BY COUNT(i.id) ASC
                      LIMIT 1;
                    END IF;

                    -- C. Calculate Priority
                    -- Spatial density
                    SELECT COUNT(*) INTO v_nearby_count FROM issues
                    WHERE ST_DWithin(
                      location, 
                      ST_SetSRID(ST_MakePoint(v_lon, v_lat), 4326), 
                      0.001 
                    )
                    AND status != 'Resolved';
                    v_spatial_density := LEAST(v_nearby_count * 10, 100);
                    
                    -- User credibility
                    SELECT COALESCE(green_credits, 0) INTO v_user_credits FROM users WHERE id = v_reporter_id;
                    
                    -- Visual severity & Textual urgency
                    -- visual: 80 if image exists, 50 default. text: fusion score * 100
                    v_base_priority := (0.4 * (CASE WHEN v_image_get_url IS NOT NULL AND v_image_get_url != '' THEN 80.0 ELSE 50.0 END)) +
                                       (0.3 * (v_fusion_score * 100.0)) +
                                       (0.2 * v_spatial_density) +
                                       (0.1 * LEAST(v_user_credits / 10, 100));
                                       
                    -- Multipliers
                    v_ai_status := CASE WHEN v_needs_human_review THEN 'Uncertain' ELSE 'Verified' END;
                    IF v_ai_status = 'Verified' THEN
                      v_priority_score := v_base_priority * 1.25;
                    ELSIF v_ai_status = 'Uncertain' THEN
                      v_priority_score := v_base_priority * 0.90;
                    ELSE
                      v_priority_score := v_base_priority;
                    END IF;
                    v_priority_score := LEAST(v_priority_score, 100);

                    -- D. Update Temporary Issue
                    UPDATE issues SET
                      category = v_mapped_category,
                      priority_score = v_priority_score,
                      ai_image_top3 = v_image_top3,
                      ai_audio_top3 = v_audio_top3,
                      ai_text_top3 = v_text_top3,
                      audio_text = v_audio_text,
                      fusion_final_category = v_final_category,
                      fusion_confidence_score = v_fusion_score,
                      needs_human_review = v_needs_human_review,
                      assigned_department_id = v_assigned_dept_id,
                      assigned_staff_id = v_assigned_staff_id,
                      "updatedAt" = NOW()
                    WHERE id = v_issue_id;

                    -- E. Update processing_job
                    UPDATE processing_jobs SET
                      status = 'done',
                      result = p_ai_result,
                      "updatedAt" = NOW()
                    WHERE id = p_job_id;

                    v_response := jsonb_build_object(
                      'status', 'done',
                      'issue_id', v_issue_id,
                      'is_duplicate', false,
                      'assigned_staff_id', v_assigned_staff_id
                    );
                  END IF;
                  
                  RETURN v_response;
                END;
                $$ LANGUAGE plpgsql;
            `);
            console.log('Targeted migrations (vector, audio_text, processing_jobs & stored proc) executed successfully');
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
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'mayor';`);
        } catch (enumErr) {}
        try {
            await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'councilor';`);
        } catch (enumErr) {}


    } catch (error) {
        console.error('PostgreSQL connection error:', error);
        process.exit(1);
    }
};

export { User, Department, Ward, Issue, Repair, AuditLog, Notification, AIFeedback, UserDevice, Role, Permission, RolePermission, UserRole, ProcessingJob, UlbBoundary };


