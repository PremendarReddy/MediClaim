import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    docType: {
        type: String,
        enum: [
            'Claim Form',
            'ID Proof',
            'Policy Card',
            'Prescription',
            'Discharge Summary',
            'Pharmacy Bill',
            'Investigation Report',
            'NEFT Details',

            'Aadhaar Card (Patient ID)',
            'PAN Card (Tax ID)',
            'Insurance Policy Copy',
            'Hospital Admission Note',
            'Doctor\'s Prescription',
            'Diagnostic Reports (Blood/Urine)',
            'X-Ray / MRI / CT Scans',
            'Surgery / OT Notes',
            'Pharmacy Bills',
            'Consumable / Equipment Bills',
            'Pre-Authorization Form',
            'Other / Miscellaneous',
            'Other'
        ],
        required: true
    },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    received: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    remarks: String
});

const claimSchema = new mongoose.Schema(
    {
        claimNumber: {
            type: String,
            required: true,
            unique: true
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        insuranceCompanyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: [
                'Pending Documents',
                'Initiated',
                'Pending Patient Consent',
                'Submitted',
                'Under Review',
                'Additional Docs Required',
                'Approved',
                'Rejected',
                'Withdrawn',
                'Amount Released'
            ],
            default: 'Initiated'
        },
        totalAmount: {
            type: Number,
            required: true
        },
        approvedAmount: {
            type: Number,
            default: 0
        },
        documents: [documentSchema],

        // AI Agent Fields
        aiRiskScore: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'PENDING'],
            default: 'PENDING'
        },
        aiRiskExplanation: String,

        // Process Logs
        history: [
            {
                status: String,
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                timestamp: { type: Date, default: Date.now },
                comment: String
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
