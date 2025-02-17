import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IGiveaway extends Document {
    _id: string;
    messageId: string;
    channelId: string;
    guildId: string;
    title: string;
    description: string;
    winnerNumber: number;
    participants: string[];
    winner: string;
    endsAt: Date;
    status: "active" | "ended";
    createdAt: Date;
    updatedAt: Date;
}

const GiveawaySchema: Schema = new Schema<IGiveaway>(
    {
        _id: { type: String, default: () => UuidUtil.generateId() },
        messageId: { type: String, required: true },
        channelId: { type: String, required: true },
        guildId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        winnerNumber: { type: Number, required: true, min: 1 },
        participants: { type: [String], default: [] },
        winner: { type: String, required: false },
        endsAt: { type: Date, required: true },
        status: { type: String, enum: ["active", "ended"], default: "active" },
    },
    { timestamps: true },
);

export const Giveaway = mongoose.model<IGiveaway>("Giveaway", GiveawaySchema);
