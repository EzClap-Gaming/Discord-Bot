import mongoose, { Schema, Document } from 'mongoose';
import { UuidUtil } from '../utils/uuidUtil';

export interface IGiveaways extends Document {
    id: string;
    messageId: string;
    channelId: string;
    guildId: string;
    title: string;
    description: string;
    winners: number;
    endsAt: Date;
    participants: string[];
    status: 'active' | 'ended';
    createdAt: Date;
    updatedAt: Date;
}

const GiveawaysSchema: Schema = new Schema<IGiveaways>({
    id: { type: String, default: () => UuidUtil.generateId() },
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    winners: { type: Number, required: true, min: 1 },
    endsAt: { type: Date, required: true },
    participants: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
}, { timestamps: true });

export const Giveaways = mongoose.model<IGiveaways>('Giveaways', GiveawaysSchema);
