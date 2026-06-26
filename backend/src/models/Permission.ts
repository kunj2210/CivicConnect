import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Permission extends Model {
    declare id: string;
    declare key: string;
}

Permission.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    tableName: 'permissions',
});
