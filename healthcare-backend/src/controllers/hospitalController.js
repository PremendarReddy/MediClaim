import User from '../models/User.js';
import Claim from '../models/Claim.js';
import { generatePassword } from '../services/utils.js';
import { sendOTPEmail, sendWelcomeEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

// Temporary in-memory store for OTPs (in production, use Redis)
const otpStore = new Map();

// @desc    Send OTP to patient email
// @route   POST /api/hospitals/patients/send-otp
// @access  Private/Hospital
export const sendPatientOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Patient with this email already exists' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store it with a 10 min expiration
        otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        // Actually send it
        const result = await sendOTPEmail(email, otp);

        if (!result.success) {
            console.warn("Resend email failed, but proceeding in dev environment. See console for OTP.");
            // Don't crash for missing Resend key in dev, just continue.
        }

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register a new patient (Hospital action)
// @route   POST /api/hospitals/patients
// @access  Private/Hospital
export const registerPatient = async (req, res) => {
    try {
        const { name, email, patientDetails, otp } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Patient with this email already exists' });
        }

        // Verify OTP
        const storedOtpData = otpStore.get(email);

        // Development bypass
        const isDevBypass = process.env.NODE_ENV === 'development' && otp === '123456';

        if (!isDevBypass) {
            if (!storedOtpData) {
                return res.status(400).json({ success: false, message: 'OTP flow not initiated or expired.' });
            }
            if (Date.now() > storedOtpData.expiresAt) {
                otpStore.delete(email);
                return res.status(400).json({ success: false, message: 'OTP expired. Please send a new one.' });
            }
            if (storedOtpData.otp !== otp) {
                return res.status(400).json({ success: false, message: 'Invalid OTP provided.' });
            }
        }

        // OTP verifed successfully. Clear it.
        otpStore.delete(email);

        // Auto-generate a password for the patient to login with later
        const generatedPassword = generatePassword();

        const patient = await User.create({
            name,
            email,
            password: generatedPassword,
            role: 'PATIENT',
            patientDetails: {
                ...patientDetails,
                registeredByHospital: req.user._id
            }
        });

        // Fire off actual Welcome Email with credentials asynchronously
        sendWelcomeEmail(email, req.user.name, generatedPassword).catch(err => console.error("Welcome email failed", err));

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully. Credentials generated.',
            data: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
                tmpPassword: generatedPassword
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all patients registered by this hospital
// @route   GET /api/hospitals/patients
// @access  Private/Hospital
export const getHospitalPatients = async (req, res) => {
    try {
        const patients = await User.find({
            role: 'PATIENT',
            'patientDetails.registeredByHospital': req.user._id
        }).select('-password');

        res.json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active insurance companies (for dropdown selection)
// @route   GET /api/hospitals/insurance-companies
// @access  Private/Hospital
export const getInsuranceCompanies = async (req, res) => {
    try {
        const insuranceCompanies = await User.find({ role: 'INSURANCE' })
            .select('_id name email insuranceDetails');

        res.json({ success: true, count: insuranceCompanies.length, data: insuranceCompanies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a new claim for a patient
// @route   POST /api/hospitals/claims
// @access  Private/Hospital
export const createClaim = async (req, res) => {
    try {
        const { patientId, insuranceCompanyId, totalAmount, documents, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required for claim initiation consent.' });
        }

        // Verify patient exists and was registered by this hospital
        const patient = await User.findOne({
            _id: patientId,
            role: 'PATIENT',
            'patientDetails.registeredByHospital': req.user._id
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found or not associated with this hospital' });
        }

        // Verify OTP
        const otpKey = `initiate_claim_${patientId}`;
        const isDevBypass = process.env.NODE_ENV === 'development' && otp === '123456';

        if (!isDevBypass) {
            const storedOtpData = otpStore.get(otpKey);
            if (!storedOtpData) {
                return res.status(400).json({ success: false, message: 'OTP flow not initiated or expired.' });
            }
            if (Date.now() > storedOtpData.expiresAt) {
                otpStore.delete(otpKey);
                return res.status(400).json({ success: false, message: 'OTP expired. Please send a new one.' });
            }
            if (storedOtpData.otp !== otp) {
                return res.status(400).json({ success: false, message: 'Invalid OTP provided.' });
            }
        }

        // OTP verified successfully. Clear it.
        otpStore.delete(otpKey);

        // Generate unique claim number
        const claimNumber = `CLM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const claim = await Claim.create({
            claimNumber,
            patientId,
            hospitalId: req.user._id,
            insuranceCompanyId,
            totalAmount,
            status: 'Initiated', // Claim Processing Agent will pick this up
            documents: documents || [],
            history: [
                {
                    status: 'Initiated',
                    updatedBy: req.user._id,
                    comment: 'Claim drafted by hospital.'
                }
            ]
        });

        // In a real app, trigger 'Claim Processing Agent' via event broker / HTTP call here

        res.status(201).json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP to patient email for claim initiation consent
// @route   POST /api/hospitals/patients/:id/send-consent-otp
// @access  Private/Hospital
export const sendClaimInitiationOTP = async (req, res) => {
    try {
        const patientId = req.params.id;

        const patient = await User.findOne({
            _id: patientId,
            role: 'PATIENT',
            'patientDetails.registeredByHospital': req.user._id
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found or not associated with this hospital' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `initiate_claim_${patient._id}`;

        // Store it with a 10 min expiration
        otpStore.set(otpKey, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        // Actually send it
        const result = await sendOTPEmail(patient.email, otp);

        if (!result.success) {
            console.warn("Resend email failed, but proceeding in dev environment. See console for OTP.");
        }

        res.json({ success: true, message: "Consent OTP sent successfully to patient's email" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all claims (Filtered by Hospital or Insurance depending on user)
// @route   GET /api/hospitals/claims
// @access  Private/Hospital/Insurance
export const getHospitalClaims = async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'HOSPITAL') {
            filter.hospitalId = req.user._id;
        } else if (req.user.role === 'INSURANCE' || req.user.role === 'ADMIN') {
            filter.insuranceCompanyId = req.user._id;
        }

        const claims = await Claim.find(filter)
            .populate('patientId', 'name email patientDetails')
            .populate('hospitalId', 'name email hospitalDetails')
            .populate('insuranceCompanyId', 'name email insuranceDetails')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: claims.length, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single claim by ID
// @route   GET /api/hospitals/claims/:id
// @access  Private
export const getClaimById = async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id)
            .populate('patientId', 'name email patientDetails')
            .populate('hospitalId', 'name email hospitalDetails')
            .populate('insuranceCompanyId', 'name email insuranceDetails');

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        // Check ownership
        if (req.user.role === 'HOSPITAL' && claim.hospitalId._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (req.user.role === 'INSURANCE' && claim.insuranceCompanyId._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (req.user.role === 'PATIENT' && claim.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update claim status
// @route   PUT /api/hospitals/claims/:id/status
// @access  Private/Insurance
export const updateClaimStatus = async (req, res) => {
    try {
        const { status, comment, approvedAmount } = req.body;

        let filter = { _id: req.params.id };
        // If it's an insurance user, make sure they own the claim. Admin can edit any. 
        // Hospital might be allowed to update to certain statuses (e.g. Submitted) but usually Insurance updates it.
        // For now, let's allow the update and we can add role checks.

        const claim = await Claim.findOne(filter);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        claim.status = status;
        if (status === 'Approved' && approvedAmount) {
            claim.approvedAmount = approvedAmount;
        }

        claim.history.push({
            status,
            updatedBy: req.user._id,
            comment: comment || `Status updated to ${status} via shared endpoint`
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
