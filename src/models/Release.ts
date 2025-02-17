import mongoose, { Schema, Document } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

export interface IRelease extends Document {
    id: string;
    guildId: string;
    repo: string;
    latestReleaseId: string;
    latestReleaseName: string;
    latestReleaseUrl: string;
    announcementChannelId: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReleaseSchema: Schema = new Schema<IRelease>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        repo: { type: String, required: true, unique: true },
        latestReleaseId: { type: String, default: null },
        latestReleaseName: { type: String, default: null },
        latestReleaseUrl: { type: String, default: null },
        announcementChannelId: { type: String, default: null },
    },
    { timestamps: true },
);

export const Release = mongoose.model<IRelease>("Release", ReleaseSchema);
