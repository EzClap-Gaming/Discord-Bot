import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IReports extends Document {
    id: string;
    type: string;
    reporterId: string;
    reporterName: string;
    reportedId: string;
    reportedName: string;
    messageLink: string;
    reason: string;
    description: string;
    priority: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const reportsSchema: Schema = new Schema<IReports>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        type: { type: String, required: true },
        reporterId: { type: String, required: true },
        reporterName: { type: String, required: true },
        reportedId: { type: String, required: true },
        reportedName: { type: String, required: true },
        messageLink: { type: String },
        reason: { type: String, required: true },
        description: { type: String },
        priority: { type: String, required: true },
        status: { type: String, default: "Open" },
    },
    { timestamps: true },
);

export const Reports = mongoose.model<IReports>("Reports", reportsSchema);
