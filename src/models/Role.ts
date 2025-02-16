import mongoose, { Document, Schema } from "mongoose";
import { UuidUtil } from "../utils/uuidUtil";

// Define the IRole interface that extends Mongoose's Document interface.
export interface IRole extends Document {
    id: string; // UUID as the primary key
    name: string; // The name of the role (e.g., 'Admin', 'Editor')
    permissions: string[]; // Array of permissions associated with the role (e.g., 'read', 'write')
    users: mongoose.Schema.Types.ObjectId[]; // Array of users that are linked to this role
    color: string; // The color associated with the role
    createdAt: Date; // The time when the role was created
    updatedAt: Date; // The time when the role was last updated
}

// Define the schema for the Role model, which maps directly to the MongoDB document structure.
const RoleSchema: Schema = new Schema<IRole>(
    {
        id: { type: String, default: () => UuidUtil.generateId() },
        name: { type: String, required: true, unique: true },
        permissions: [{ type: String, required: true }],
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        color: { type: String, required: true }, // Color field added
    },
    { timestamps: true },
);

// Export the Role model
export const Role = mongoose.model<IRole>("Role", RoleSchema);
