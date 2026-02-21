import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class UlbBoundary extends Model {
    declare id: number;
    declare name: string;
    declare geom: any;
}

UlbBoundary.init(
    {
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
        geom: {
            type: DataTypes.GEOMETRY('POLYGON', 4326),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'ulb_boundaries',
        timestamps: false,
    }
);
