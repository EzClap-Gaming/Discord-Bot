import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface IKick extends Document {
    id: string;
    guildId: string;
    memberId: string;
    kickerId: string;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

const kickSchema: Schema = new Schema<IKick>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        memberId: { type: String, required: true },
        kickerId: { type: String, required: true },
        reason: { type: String, required: true },
    },
    { timestamps: true },
);

export const KickModel = mongoose.model<IKick>("Kick", kickSchema);
