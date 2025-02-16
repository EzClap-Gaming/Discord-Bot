import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IReactionRoleLog {
    userId: string;
    userName: string;
    roleId: string;
    roleName: string;
    action: "added" | "removed";
    createdAt: Date;
    updatedAt: Date;
}

export interface IReactionRole extends Document {
    id: string;
    guildId: string;
    messageId: string;
    channelId: string;
    roles: Array<{ emoji: string; roleId: string }>;
    title: string;
    description: string;
    logs: IReactionRoleLog[];
    createdAt: Date;
    updatedAt: Date;
}

const reactionRoleSchema: Schema = new Schema<IReactionRole>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        messageId: { type: String, required: true },
        channelId: { type: String, required: true },
        roles: [
            {
                emoji: { type: String, required: true },
                roleId: { type: String, required: true },
            },
        ],
        title: { type: String, required: true },
        description: { type: String, required: true },
        logs: [
            {
                userId: { type: String, required: true },
                userName: { type: String },
                roleId: { type: String, required: true },
                roleName: { type: String },
                action: { type: String, enum: ["added", "removed"], required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true },
);

export const ReactionRole = mongoose.model<IReactionRole>("ReactionRole", reactionRoleSchema);
