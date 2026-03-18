import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Resolved'],
            default: 'Open'
        },
        raisedByRole: {
            type: String,
            enum: ['HOSPITAL', 'PATIENT'],
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
