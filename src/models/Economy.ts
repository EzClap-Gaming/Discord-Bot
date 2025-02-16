import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IEconomyDocument extends Document {
    id: string;
    userId: string;
    balance: number;
    bankBalance: number;
    dailyStreak: number;
    lastDaily: Date | null;
    workCooldown: Date | null;
    robCooldown: Date | null;
    betCooldown: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const economySchema: Schema = new Schema<IEconomyDocument>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        userId: { type: String, required: true, unique: true },
        balance: { type: Number, required: true, default: 0 },
        bankBalance: { type: Number, required: true, default: 0 },
        dailyStreak: { type: Number, required: true, default: 0 },
        lastDaily: { type: Date, default: null },
        workCooldown: { type: Date, default: null },
        robCooldown: { type: Date, default: null },
        betCooldown: { type: Date, default: null },
    },
    { timestamps: true },
);

export const Economy = mongoose.model<IEconomyDocument>("Economy", economySchema);
