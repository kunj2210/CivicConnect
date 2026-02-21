import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
export class UserDevice extends Model {
    id;
    user_id; // citizen_phone or email
    fcm_token;
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
//# sourceMappingURL=UserDevice.js.map