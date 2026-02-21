import { Model } from 'sequelize';
export declare class Notification extends Model {
    id: number;
    user_id: string;
    title: string;
    message: string;
    type: string;
    read_status: boolean;
    timestamp: Date;
}
//# sourceMappingURL=Notification.d.ts.map