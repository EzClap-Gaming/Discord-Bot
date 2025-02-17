import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface IInvite extends Document {
    id: string;
    guildId: string;
    channelId: string;
    inviteUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const inviteSchema: Schema = new Schema<IInvite>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        channelId: { type: String, required: true },
        inviteUrl: { type: String, required: true },
    },
    { timestamps: true },
);

export const InviteModel = mongoose.model<IInvite>("Invite", inviteSchema);
