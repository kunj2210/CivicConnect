import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';
export class Report extends Model {
}
Report.init({
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
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: DataTypes.GEOMETRY('POINT', 4326),
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'reports',
});
//# sourceMappingURL=Report.js.map