import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface INickname extends Document {
    id: string;
    guildId: string;
    memberId: string;
    oldNickname: string;
    newNickname: string;
    changedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const nicknameSchema: Schema = new Schema<INickname>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        memberId: { type: String, required: true },
        oldNickname: { type: String, required: true },
        newNickname: { type: String, required: true },
        changedBy: { type: String, required: true },
    },
    { timestamps: true },
);

export const NicknameModel = mongoose.model<INickname>("Nickname", nicknameSchema);
