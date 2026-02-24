import mongoose, { Schema, Document } from 'mongoose';

export interface ICitizenProfile extends Document {
    identifier: string; // phone number or email
    green_credits: number;
    upvoted_reports: string[]; // array of report_ids
}

const CitizenProfileSchema: Schema = new Schema({
    identifier: { type: String, required: true, unique: true },
    green_credits: { type: Number, default: 0 },
    upvoted_reports: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<ICitizenProfile>('CitizenProfile', CitizenProfileSchema);
