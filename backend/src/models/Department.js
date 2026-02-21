import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
export class Department extends Model {
    id;
    name;
    head;
    staff_count;
    status;
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
}, {
    sequelize,
    modelName: 'Department',
});
//# sourceMappingURL=Department.js.map