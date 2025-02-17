import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface IMute extends Document {
    id: string;
    guildId: string;
    userId: string;
    moderatorId: string;
    muteNumber: string;
    reason: string;
    duration: string;
    mutedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const muteSchema: Schema = new Schema<IMute>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        userId: { type: String, required: true },
        moderatorId: { type: String, required: true },
        muteNumber: { type: String, required: true },
        reason: { type: String, required: true },
        duration: { type: String, required: true },
        mutedAt: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

export const Mute = mongoose.model<IMute>("Mute", muteSchema);
