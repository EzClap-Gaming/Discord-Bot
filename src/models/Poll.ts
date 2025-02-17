import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface IPoll extends Document {
    id: string;
    guildId: string;
    question: string;
    creatorId: string;
    duration: number;
    yesVotes: number;
    noVotes: number;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const pollSchema: Schema = new Schema<IPoll>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        question: { type: String, required: true },
        creatorId: { type: String, required: true },
        duration: { type: Number, required: true },
        yesVotes: { type: Number, default: 0 },
        noVotes: { type: Number, default: 0 },
        endedAt: { type: Date, default: null },
    },
    { timestamps: true },
);

export const PollModel = mongoose.model<IPoll>("Poll", pollSchema);
