import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface ILevelDocument extends Document {
    id: string;
    userId: string;
    xp: number;
    level: number;
    levelUpCount: number;
    xpHistory: { date: Date; xpEarned: number }[];
    createdAt: Date;
    updatedAt: Date;
}

const levelSchema: Schema = new Schema<ILevelDocument>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        userId: { type: String, required: true, unique: true },
        xp: { type: Number, required: true, default: 0 },
        level: { type: Number, required: true, default: 0 },
        levelUpCount: { type: Number, required: true, default: 0 },
        xpHistory: [
            {
                date: { type: Date, required: true },
                xpEarned: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true },
);

export const Level = mongoose.model<ILevelDocument>("Level", levelSchema);
