import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        targetRoles: [
            {
                type: String,
                enum: ['patient', 'hospital', 'insurance', 'all'],
                default: 'all'
            }
        ],
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional, if a notification is meant for a specific user ID
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
