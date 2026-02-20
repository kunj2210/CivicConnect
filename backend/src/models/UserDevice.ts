import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

export class UserDevice extends Model {
    public id!: number;
    public user_id!: string; // citizen_phone or email
    public fcm_token!: string;
}

UserDevice.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fcm_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    modelName: 'UserDevice',
    timestamps: true,
});
