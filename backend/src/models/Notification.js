import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
export class Notification extends Model {
    id;
    user_id; // Citizen phone or Admin ID
    title;
    message;
    type; // 'Info', 'Alert', 'Success'
    read_status;
    timestamp;
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
//# sourceMappingURL=Notification.js.map