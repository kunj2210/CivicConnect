import mongoose, { Document } from 'mongoose';
export interface ICitizenProfile extends Document {
    identifier: string;
    green_credits: number;
    upvoted_reports: string[];
}
declare const _default: mongoose.Model<ICitizenProfile, {}, {}, {}, mongoose.Document<unknown, {}, ICitizenProfile, {}, mongoose.DefaultSchemaOptions> & ICitizenProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICitizenProfile>;
export default _default;
//# sourceMappingURL=CitizenProfile.d.ts.map