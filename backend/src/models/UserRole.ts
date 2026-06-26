import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class UserRole extends Model {
    declare user_id: string;
    declare role_id: string;
}

UserRole.init({
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'roles',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize,
    tableName: 'user_roles',
    timestamps: false
});
