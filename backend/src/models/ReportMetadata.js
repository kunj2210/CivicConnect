import mongoose, { Schema, Document } from 'mongoose';
const ReportMetadataSchema = new Schema({
    report_id: { type: String, required: true, unique: true },
    image_url: { type: String, required: true },
    description: { type: String },
    exif_data: { type: Object },
    device_info: { type: Object },
    citizen_phone: { type: String, default: 'anonymous' },
    jurisdiction: { type: String },
}, { timestamps: true });
export default mongoose.model('ReportMetadata', ReportMetadataSchema);
//# sourceMappingURL=ReportMetadata.js.map