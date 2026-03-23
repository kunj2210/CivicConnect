import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Department extends Model {
    declare id: string;
    declare name: string;
    declare contact_email: string;
}

Department.init({
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
    contact_email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'departments',
});

