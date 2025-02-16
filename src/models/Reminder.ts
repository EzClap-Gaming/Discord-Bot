import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

interface IReminder extends Document {
    id: string;
    userId: string;
    message: string;
    time: number;
    createdAt: Date;
    updatedAt: Date;
}

const reminderSchema: Schema = new Schema<IReminder>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        userId: { type: String, required: true },
        message: { type: String, required: true },
        time: { type: Number, required: true },
    },
    { timestamps: true },
);

export const ReminderModel = mongoose.model<IReminder>("Reminder", reminderSchema);
