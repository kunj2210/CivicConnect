import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class AuditLog extends Model {
    declare id: string;
    declare actor_id: string;
    declare event_type: string;
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
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        event_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },

    {
        sequelize,
        tableName: 'audit_logs',
        timestamps: true,
    }

);

