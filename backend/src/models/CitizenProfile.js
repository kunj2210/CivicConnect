import mongoose, { Schema, Document } from 'mongoose';
const CitizenProfileSchema = new Schema({
    identifier: { type: String, required: true, unique: true },
    green_credits: { type: Number, default: 0 },
    upvoted_reports: [{ type: String }]
}, { timestamps: true });
export default mongoose.model('CitizenProfile', CitizenProfileSchema);
//# sourceMappingURL=CitizenProfile.js.map