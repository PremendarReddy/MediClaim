import Claim from '../models/Claim.js';
import User from '../models/User.js';

// @desc    Get patient's own claims
// @route   GET /api/patients/claims
// @access  Private/Patient
export const getMyClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ patientId: req.user._id })
            .populate('hospitalId', 'name hospitalDetails')
            .populate('insuranceCompanyId', 'name insuranceDetails');

        res.json({ success: true, count: claims.length, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import { sendOTPEmail } from '../services/emailService.js';

// Temporary in-memory store for OTPs (in production, use Redis)
const otpStore = new Map();

// @desc    Patient uploads missing document to a claim
// @route   PUT /api/patients/claims/:id/documents
// @access  Private/Patient
export const uploadMissingDocument = async (req, res) => {
    try {
        const { docType, fileUrl, name } = req.body;

        const claim = await Claim.findOne({ _id: req.params.id, patientId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        claim.documents.push({
            docType,
            fileUrl,
            uploadedBy: req.user._id,
            remarks: `Uploaded by patient: ${name || docType}`
        });

        claim.history.push({
            status: claim.status,
            updatedBy: req.user._id,
            comment: `Patient uploaded document: ${docType}`
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP to patient for claim submission consent
// @route   POST /api/patients/claims/:id/send-otp
// @access  Private/Patient
export const sendClaimOTP = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, patientId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        const email = req.user.email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expire in 10 mins
        otpStore.set(`claim_${claim._id}_${req.user._id}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        await sendOTPEmail(email, otp);

        res.json({ success: true, message: "OTP sent to registered email for claim approval" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Patient approves processing of a drafted claim (With OTP Verification)
// @route   PUT /api/patients/claims/:id/approve
// @access  Private/Patient
export const approveClaim = async (req, res) => {
    try {
        const { otp } = req.body;
        const claim = await Claim.findOne({ _id: req.params.id, patientId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (claim.status !== 'Initiated' && claim.status !== 'Pending Patient Consent') {
            return res.status(400).json({ success: false, message: `Cannot approve claim in ${claim.status} status` });
        }

        const otpKey = `claim_${claim._id}_${req.user._id}`;
        // Development bypass
        const isDevBypass = process.env.NODE_ENV === 'development' && otp === '123456';

        if (!isDevBypass) {
            const storedOtpData = otpStore.get(otpKey);

            if (!storedOtpData) {
                return res.status(400).json({ success: false, message: 'OTP flow not initiated or expired.' });
            }
            if (Date.now() > storedOtpData.expiresAt) {
                otpStore.delete(otpKey);
                return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
            }
            if (storedOtpData.otp !== otp) {
                return res.status(400).json({ success: false, message: 'Invalid OTP provided.' });
            }
        }

        // Clear OTP after success
        otpStore.delete(otpKey);

        claim.status = 'Submitted';
        claim.history.push({
            status: 'Submitted',
            updatedBy: req.user._id,
            comment: 'Patient provided consent via verified OTP. Claim forwarded to Insurance.'
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
