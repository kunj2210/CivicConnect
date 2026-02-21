import mongoose, { Document } from 'mongoose';
export interface IReportMetadata extends Document {
    report_id: string;
    image_url: string;
    description?: string;
    exif_data: any;
    device_info: any;
    citizen_phone: string;
    jurisdiction?: string;
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