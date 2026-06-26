import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Department extends Model {
    declare id: string;
    declare name: string;
    declare contact_email: string;
    declare ulb_id: number | null;
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
    ulb_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'ulb_boundaries',
            key: 'id',
        },
    },
}, {
    sequelize,
    tableName: 'departments',
});

