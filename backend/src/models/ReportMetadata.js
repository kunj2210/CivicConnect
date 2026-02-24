import mongoose, { Schema, Document } from 'mongoose';
const ReportMetadataSchema = new Schema({
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
export default mongoose.model('ReportMetadata', ReportMetadataSchema);
//# sourceMappingURL=ReportMetadata.js.map