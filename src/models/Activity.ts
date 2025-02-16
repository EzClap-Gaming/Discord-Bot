import mongoose, { Schema, Document } from 'mongoose';
import { UuidUtil } from '../utils/uuidUtil';

export interface IActivity extends Document {
    id: string;
    userId: string;
    guildId: string;
    messagesSent: number;
    voiceTime: number;
    lastJoinTimestamp: number | null;
    createdAt: Date;
    updatedAt: Date;
}

const activitySchema: Schema = new Schema<IActivity>({
    id: { type: String, default: () => UuidUtil.generateId() },
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    messagesSent: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 },
    lastJoinTimestamp: { type: Number, default: null },
}, { timestamps: true });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
