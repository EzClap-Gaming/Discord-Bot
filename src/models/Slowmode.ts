import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface ISlowmode extends Document {
    id: string;
    guildId: string;
    channelId: string;
    slowmode: number; // Zeit in Sekunden (0 bedeutet deaktiviert)
    createdAt: Date;
    updatedAt: Date;
}

const slowmodeSchema: Schema = new Schema<ISlowmode>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        guildId: { type: String, required: true },
        channelId: { type: String, required: true },
        slowmode: { type: Number, required: true, default: 0 },
    },
    { timestamps: true },
);

export const SlowmodeModel = mongoose.model<ISlowmode>("Slowmode", slowmodeSchema);
