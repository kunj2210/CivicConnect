import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Ward extends Model {
    declare id: string;
    declare boundary: any;
    declare dept_id: string;
    declare name: string;
}

Ward.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    boundary: {
        type: DataTypes.GEOMETRY('POLYGON', 4326),
        allowNull: false,
    },
    dept_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'wards',
});
