import Claim from '../models/Claim.js';
import User from '../models/User.js';
import DoctorSlot from '../models/DoctorSlot.js';

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

        // Trigger Auto-Verification Hook
        const requiredDocs = [
            'Claim Form', 'ID Proof', 'Policy Card',
            'Prescription', 'Discharge Summary', 'Pharmacy Bill',
            'Investigation Report', 'NEFT Details'
        ];

        const docAliasMap = {
            'Aadhaar Card (Patient ID)': 'ID Proof',
            'PAN Card (Tax ID)': 'ID Proof',
            'Insurance Policy Copy': 'Policy Card',
            'Diagnostic Report': 'Investigation Report',
            'Radiology (X-Ray/MRI/CT)': 'Investigation Report',
            'Blood Test': 'Investigation Report',
            'X-Ray': 'Investigation Report',
            'CT Scan': 'Investigation Report',
            'Ultrasound': 'Investigation Report',
            'ECG': 'Investigation Report',
            'Hospital Bill': 'Pharmacy Bill',
            'Doctor\'s Prescription': 'Prescription',
            'Diagnostic Reports (Blood/Urine)': 'Investigation Report',
            'X-Ray / MRI / CT Scans': 'Investigation Report',
            'Pharmacy Bills': 'Pharmacy Bill'
        };

        const providedDocs = claim.documents.map(d => docAliasMap[d.docType] || d.docType);
        const missingDocuments = requiredDocs.filter(reqDoc => !providedDocs.includes(reqDoc));

        if (missingDocuments.length === 0 && claim.status === 'Pending Documents') {
            claim.status = 'Submitted';
            claim.history.push({
                status: 'Submitted',
                updatedBy: req.user._id,
                comment: 'All mandatory documents verified. Claim successfully submitted to insurer.'
            });
        }

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

// @desc    Send OTP to patient for withdrawing a claim
// @route   POST /api/patients/claims/:id/send-withdraw-otp
// @access  Private/Patient
export const sendWithdrawOTP = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, patientId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (['Approved', 'Rejected', 'Withdrawn', 'Amount Released'].includes(claim.status)) {
            return res.status(400).json({ success: false, message: `Cannot withdraw a claim that is already ${claim.status}.` });
        }

        const email = req.user.email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(`withdraw_${claim._id}_${req.user._id}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
        await sendOTPEmail(email, otp);

        res.json({ success: true, message: "Withdrawal OTP sent to your registered email." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Withdraw claim using OTP
// @route   PUT /api/patients/claims/:id/withdraw
// @access  Private/Patient
export const withdrawClaim = async (req, res) => {
    try {
        const { otp } = req.body;
        const claim = await Claim.findOne({ _id: req.params.id, patientId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        const otpKey = `withdraw_${claim._id}_${req.user._id}`;
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

        otpStore.delete(otpKey);

        claim.status = 'Withdrawn';
        claim.history.push({
            status: 'Withdrawn',
            updatedBy: req.user._id,
            comment: 'Patient withdrew the claim successfully via OTP verification.'
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all available Doctor Slots for patients
// @route   GET /api/patients/slots
// @access  Private/Patient
export const getAvailableSlots = async (req, res) => {
    try {
        // Find slots today or in the future
        const today = new Date().toISOString().split('T')[0];
        const slots = await DoctorSlot.find({ date: { $gte: today } }).populate('hospitalId', 'name');

        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Book a Doctor Slot
// @route   POST /api/patients/slots/:id/book
// @access  Private/Patient
export const bookSlot = async (req, res) => {
    try {
        const slot = await DoctorSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        if (slot.slotsFilled >= slot.maxSlots) {
            return res.status(400).json({ success: false, message: 'This slot is fully booked' });
        }

        const isAlreadyBooked = slot.bookedPatients.find(p => p.patientId && p.patientId.toString() === req.user._id.toString());
        if (isAlreadyBooked) {
             return res.status(400).json({ success: false, message: 'You have already booked this slot' });
        }

        slot.bookedPatients.push({
            patientId: req.user._id,
            patientName: req.user.name,
            patientEmail: req.user.email
        });
        slot.slotsFilled += 1;

        await slot.save();

        res.json({ success: true, data: slot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get patient analytics widget data (expenses, limits)
// @route   GET /api/patients/analytics
// @access  Private/Patient
export const getPatientAnalytics = async (req, res) => {
    try {
        const patient = await User.findById(req.user._id);

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // Real data might map total claim costs to their created month.
        // For our prototype, we emulate a progressive cost timeline tied to user profile age or active claims.
        const claims = await Claim.find({ patientId: req.user._id });
        
        let healthRisk = "Low Analysis";
        if (claims.length > 3) healthRisk = "Moderate Risk";
        if (claims.some(c => c.totalAmount > 300000)) healthRisk = "High Severity";

        // Generate actual expense data dynamically from the last 6 months
        const expenseData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = monthNames[d.getMonth()];

            // Filter claims matching this specific year and month block
            const monthlyClaims = claims.filter(c => {
                const claimDate = new Date(c.createdAt);
                return claimDate.getMonth() === d.getMonth() && claimDate.getFullYear() === d.getFullYear();
            });

            // Sum actual limits
            const monthlyCost = monthlyClaims.reduce((acc, c) => acc + (c.approvedAmount || c.totalAmount || 0), 0);

            expenseData.push({ month: monthName, cost: monthlyCost });
        }

        res.json({
            success: true,
            data: {
                healthRisk,
                expenses: expenseData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
