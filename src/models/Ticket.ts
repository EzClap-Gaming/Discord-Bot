import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketsSchema extends Document {
    guildId: string;
    category: string;
    channel: string;
    role: string;
    advisorRole: string;
    logsId: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

const ticketsSchema = new Schema({
    guildId: { type: String, required: true },
    category: { type: String, required: true },
    channel: { type: String, required: true },
    role: { type: String, required: true },
    advisorRole: { type: String, required: false },
    logsId: { type: String, required: true },
    ownerId: { type: String },
}, { timestamps: true });

export const Tickets = mongoose.model<ITicketsSchema>('Tickets', ticketsSchema);
