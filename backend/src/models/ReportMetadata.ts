import mongoose, { Schema, Document } from 'mongoose';

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

const ReportMetadataSchema: Schema = new Schema({
    report_id: { type: String, required: true, unique: true },
    image_url: { type: String, required: true },
    description: { type: String },
    exif_data: { type: Object },
    device_info: { type: Object },
    citizen_phone: { type: String, default: 'anonymous' },
    jurisdiction: { type: String },
    assigned_department_id: { type: Number },
    resolution_image_url: { type: String },
    citizen_feedback_rating: { type: Number },
    resolution_time: { type: Date },
    upvote_count: { type: Number, default: 0 },
    is_archived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IReportMetadata>('ReportMetadata', ReportMetadataSchema);
