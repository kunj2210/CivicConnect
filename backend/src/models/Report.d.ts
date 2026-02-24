import { Model } from 'sequelize';
export declare class Report extends Model {
    id: number;
    report_id: string;
    category: string;
    status: string;
    remarks: string;
    location: any;
    timestamp: Date;
    assigned_department_id: number | null;
    priority_score: number;
    sla_deadline: Date | null;
}
//# sourceMappingURL=Report.d.ts.map