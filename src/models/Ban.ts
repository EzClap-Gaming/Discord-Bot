import mongoose, { Document, Schema } from 'mongoose';
import { UuidUtil } from '../utils/uuidUtil';

export interface IBan extends Document {
    id: string;
    userId: string;
    reason: string;
    bannedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const banSchema: Schema = new Schema<IBan>({
    id: { type: String, default: () => UuidUtil.generateId() },
    userId: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    bannedBy: { type: String, required: true }
}, { timestamps: true });

export const Ban = mongoose.model<IBan>('Ban', banSchema);
