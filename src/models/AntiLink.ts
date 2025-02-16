import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IAntiLink extends Document {
    id: string;
    guildId: string;
    isAntiLinkEnabled: boolean;
    allowedChannels: string[];
    createdAt: Date;
    updatedAt: Date;
}

const antiLinkSchema: Schema = new Schema<IAntiLink>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        isAntiLinkEnabled: { type: Boolean, required: false },
        allowedChannels: { type: [String], default: [] },
    },
    { timestamps: true },
);

export const AntiLink = mongoose.model<IAntiLink>("AntiLink", antiLinkSchema);
