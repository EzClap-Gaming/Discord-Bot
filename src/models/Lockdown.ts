import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface ILockdown extends Document {
    id: string;
    channelId: string;
    duration: number; // Duration in minutes (0 for permanent lock)
    createdAt: Date;
    updatedAt: Date;
}

const LockdownSchema: Schema = new Schema<ILockdown>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        channelId: { type: String, required: true, unique: true },
        duration: { type: Number, required: true },
    },
    { timestamps: true },
);

export const Lockdown = mongoose.model<ILockdown>("Lockdown", LockdownSchema);
