import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Report extends Model {
    declare id: number;
    declare report_id: string;
    declare category: string;
    declare status: string;
    declare location: any; // Geometry point
    declare timestamp: Date;
}

Report.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        report_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved'),
            defaultValue: 'Pending',
        },
        location: {
            type: DataTypes.GEOMETRY('POINT', 4326),
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'reports',
    }
);
