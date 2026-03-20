import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Department extends Model {
    declare id: number;
    declare name: string;
    declare head: string;
    declare staff_count: number;
    declare status: string;
    declare handled_categories: string[];
}

Department.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    head: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    staff_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Maintenance', 'Inactive'),
        defaultValue: 'Active',
    },
    handled_categories: {
        type: DataTypes.JSONB,
        defaultValue: [],
    },
}, {
    sequelize,
    modelName: 'Department',
});
