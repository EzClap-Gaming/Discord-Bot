import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IWarn extends Document {
    id: string;
    guildId: string;
    userId: string;
    moderatorId: string;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

const warnSchema: Schema = new Schema<IWarn>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        userId: { type: String, required: true },
        moderatorId: { type: String, required: true },
        reason: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: true },
);

export const Warn = mongoose.model<IWarn>("Warn", warnSchema);
