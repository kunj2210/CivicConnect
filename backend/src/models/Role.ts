import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Role extends Model {
    declare id: string;
    declare name: string;
}

Role.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    tableName: 'roles',
});
