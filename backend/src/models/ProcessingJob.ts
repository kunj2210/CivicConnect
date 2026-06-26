import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class ProcessingJob extends Model {
    declare id: string;
    declare issue_id: string | null;
    declare image_s3_key: string | null;
    declare image_get_url: string | null;
    declare audio_s3_key: string | null;
    declare audio_get_url: string | null;
    declare description: string | null;
    declare latitude: number;
    declare longitude: number;
    declare reporter_id: string;
    declare ward_id: string;
    declare status: string;
    declare attempts: number;
    declare result: any;
    declare error: string | null;
}

ProcessingJob.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    issue_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'issues',
            key: 'id',
        },
    },
    image_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_get_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    audio_s3_key: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    audio_get_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false,
    },
    reporter_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    ward_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    result: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: 'processing_jobs',
    timestamps: true,
});
