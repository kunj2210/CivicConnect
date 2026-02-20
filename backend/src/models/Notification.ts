import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class Notification extends Model {
    public id!: number;
    public user_id!: string; // Citizen phone or Admin ID
    public title!: string;
    public message!: string;
    public type!: string; // 'Info', 'Alert', 'Success'
    public read_status!: boolean;
    public timestamp!: Date;
}

Notification.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'Info', // Info, Alert, Success
    },
    read_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Notification',
    timestamps: true,
});
