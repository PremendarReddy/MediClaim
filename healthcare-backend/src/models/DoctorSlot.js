import mongoose from 'mongoose';

const doctorSlotSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    date: {
        type: String, // Stored as YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // HH:MM AM/PM
        required: true
    },
    maxSlots: {
        type: Number,
        required: true,
        default: 1
    },
    slotsFilled: {
        type: Number,
        default: 0
    },
    bookedPatients: [{
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        patientName: String,
        patientEmail: String,
        bookedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Optionally create compound indexes so the same doctor at the same hospital can't double book
doctorSlotSchema.index({ hospitalId: 1, doctorName: 1, date: 1, time: 1 }, { unique: true });

const DoctorSlot = mongoose.model('DoctorSlot', doctorSlotSchema);
export default DoctorSlot;
