import mongoose, { Schema, Document } from 'mongoose';

export interface IReportMetadata extends Document {
    report_id: string;
    image_url: string;
    description?: string;
    exif_data: any;
    device_info: any;
    citizen_phone: string;
    jurisdiction?: string;
}

const ReportMetadataSchema: Schema = new Schema({
    report_id: { type: String, required: true, unique: true },
    image_url: { type: String, required: true },
    description: { type: String },
    exif_data: { type: Object },
    device_info: { type: Object },
    citizen_phone: { type: String, default: 'anonymous' },
    jurisdiction: { type: String },
}, { timestamps: true });

export default mongoose.model<IReportMetadata>('ReportMetadata', ReportMetadataSchema);
