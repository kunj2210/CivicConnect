import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Notification extends Model {
    declare id: string;
    declare user_id: string;
    declare title: string;
    declare body: string;
    declare data: any;
    declare is_read: boolean;
}

Notification.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
});

