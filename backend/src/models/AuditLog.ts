import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class AuditLog extends Model {
    declare id: number;
    declare audit_id: string;
    declare report_id: string;
    declare initiating_actor_id: string;
    declare lifecycle_state_change: string;
    declare timestamp: Date;
}

AuditLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        audit_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        report_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        initiating_actor_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lifecycle_state_change: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'audit_logs',
        timestamps: false,
    }
);
