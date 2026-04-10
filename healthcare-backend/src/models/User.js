import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['PATIENT', 'HOSPITAL', 'INSURANCE', 'ADMIN'],
            required: true,
        },
        // Hospital Specific
        hospitalDetails: {
            registrationNumber: String,
            address: String,
            contactPerson: String,
            bankDetails: {
                accountName: String,
                accountNumber: String,
                ifscCode: String,
                bankName: String,
            },
            verified: { type: Boolean, default: false }
        },
        // Patient Specific
        patientDetails: {
            dateOfBirth: Date,
            gender: { type: String, enum: ['Male', 'Female', 'Other'] },
            bloodGroup: String,
            address: String,
            phoneNumber: String,
            aadhar: String,
            emergencyContact: {
                name: String,
                relation: String,
                phone: String
            },
            status: {
                type: String,
                enum: ['Pending', 'Active', 'Discharged'],
                default: 'Active'
            },
            nextCheckupDate: {
                type: Date
            },
            criticalAlert: {
                type: Boolean,
                default: false
            },
            // Link to the hospitals that created or linked this patient profile
            registeredByHospitals: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }],
            insuranceDetails: {
                providerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                providerName: String,
                policyNumber: String,
                validUpto: Date,
                coverageAmount: Number,
                balanceAmount: Number,
                memberId: String,
                isCustomProvider: { type: Boolean, default: false },
                customProviderName: String,
                customProviderEmail: String,
                customProviderPhone: String,
                coverageBreakdown: [{
                     sectionName: { type: String, required: true },
                     limit: { type: Number, required: true }
                }],
                insuranceDocuments: [{
                    docName: String,
                    fileUrl: String,
                    uploadedDate: { type: Date, default: Date.now }
                }]
            },
            medicalHistory: [{
                docType: String,
                fileUrl: String,
                uploadedDate: { type: Date, default: Date.now }
            }]
        },
        // Insurance Company Specific
        insuranceDetails: {
            companyName: String,
            licenseNumber: String,
            supportEmail: String,
            verified: { type: Boolean, default: false }
        },
        // Security Fields
        twoFactorEnabled: { type: Boolean, default: false },
        twoFactorSecret: { type: String },
        resetPasswordOTP: { type: String },
        resetPasswordExpire: { type: Date },
        isVerified: { type: Boolean, default: true },
        registrationOTP: { type: String },
        registrationOTPExpire: { type: Date }
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
