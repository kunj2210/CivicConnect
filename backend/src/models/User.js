import mongoose, { Schema, Document } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Authority'], required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map