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
        type: DataTypes.ENUM('Pending', 'In Progress', 'Pending Confirmation', 'Resolved'),
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
    priority_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    sla_deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    assigned_department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Departments', // This relies on Sequelize's pluralization or the explicit table name
            key: 'id',
        },
    },
}, {
    sequelize,
    tableName: 'reports',
});
//# sourceMappingURL=Report.js.map