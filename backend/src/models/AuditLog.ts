import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class AuditLog extends Model {
    declare id: string;
    declare actor_id: string;
    declare event_type: string;
    declare target_resource: string | null;
    declare target_resource_id: string | null;
    declare old_value: any;
    declare new_value: any;
    declare payload: any;
}


AuditLog.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        actor_id: {
            type: DataTypes.STRING, // Keep as STRING to allow 'SYSTEM' fallback
            allowNull: false,
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // The type of resource affected (e.g. 'issue', 'user')
        target_resource: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // The UUID of the affected resource
        target_resource_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Snapshot of state before the change
        old_value: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        // Snapshot of state after the change
        new_value: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        // Extra context (description, IP address, etc.)
        payload: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
        },
    },

    {
        sequelize,
        tableName: 'audit_logs',
        timestamps: true,
    }

);

