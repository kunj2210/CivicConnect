import mongoose, { Document } from 'mongoose';
export interface IReportMetadata extends Document {
    report_id: string;
    image_url: string;
    description?: string;
    exif_data: any;
    device_info: any;
    citizen_phone: string;
    jurisdiction?: string;
    assigned_department_id?: number | null;
    resolution_image_url?: string;
    citizen_feedback_rating?: number;
    resolution_time?: Date;
    upvote_count?: number;
    is_archived?: boolean;
}
declare const _default: mongoose.Model<IReportMetadata, {}, {}, {}, mongoose.Document<unknown, {}, IReportMetadata, {}, mongoose.DefaultSchemaOptions> & IReportMetadata & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IReportMetadata>;
export default _default;
//# sourceMappingURL=ReportMetadata.d.ts.map