import User from '../models/User.js';
import Claim from '../models/Claim.js';
import DoctorSlot from '../models/DoctorSlot.js';
import { generatePassword } from '../services/utils.js';
import { sendOTPEmail, sendWelcomeEmail, sendCustomInsurerNotification } from '../services/emailService.js';
import { sendOTPSMS } from '../services/smsService.js';
import bcrypt from 'bcryptjs';
import { analyzeInsuranceDocument } from '../services/aiService.js';

// Temporary in-memory store for OTPs (in production, use Redis)
const otpStore = new Map();

// @desc    Send OTP to patient email and phone
// @route   POST /api/hospitals/patients/send-otp
// @access  Private/Hospital
export const sendPatientOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({ success: false, message: "Email and Phone are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            if (userExists.role !== 'PATIENT') {
                return res.status(400).json({ success: false, message: 'A non-patient user with this email already exists.' });
            }
            const hospitals = userExists.patientDetails?.registeredByHospitals || [];
            if (hospitals.some(id => id.toString() === req.user._id.toString())) {
                 return res.status(400).json({ success: false, message: 'Patient is already registered with your hospital.' });
            }
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store it with a 10 min expiration
        otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

        // Actually send it
        const emailResult = await sendOTPEmail(email, otp);
        const smsResult = await sendOTPSMS(phone, otp);

        if (!emailResult.success || !smsResult.success) {
            console.warn("OTP delivery failed for one or more channels, but proceeding in dev environment. See console for OTP.");
            // Don't crash for missing keys in dev, just continue.
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
        console.log("REGISTER PATIENT Body:", req.body);
        console.log("REGISTER PATIENT File:", req.file);
        
        let { name, email, patientDetails, otp } = req.body;

        // since we are using FormData now, patientDetails will be a stringified object
        if (typeof patientDetails === 'string') {
            patientDetails = JSON.parse(patientDetails);
        }

        const userExists = await User.findOne({ email });

        // Verify OTP early
        const storedOtpData = otpStore.get(email);

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

        // OTP verified successfully. Clear it.
        otpStore.delete(email);

        // --- AI DOCUMENT ANALYSIS ---
        let finalInsuranceDetails = patientDetails.insuranceDetails || null;
        
        if (req.file && finalInsuranceDetails) {
            // Build the public URL for the uploaded file
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            
            // Populate the document record
            finalInsuranceDetails.insuranceDocuments = [{
                docName: req.file.originalname,
                fileUrl: fileUrl,
                uploadedDate: Date.now()
            }];
            
            // Run AI Analysis
            const aiData = await analyzeInsuranceDocument(req.file.path, req.file.mimetype);
            if (aiData) {
                 // Merge the AI extracted coverage limits into the explicit record
                 console.log("AI Extracted details:", aiData);
                 if (aiData.coverageAmount) finalInsuranceDetails.coverageAmount = aiData.coverageAmount;
                 if (aiData.validUpto) finalInsuranceDetails.validUpto = aiData.validUpto;
                 // Set balance amount equally to coverage amount initially if needed
                 if (aiData.coverageAmount && !finalInsuranceDetails.balanceAmount) {
                     finalInsuranceDetails.balanceAmount = aiData.coverageAmount;
                 }
            }
        }

        if (userExists) {
            if (userExists.role !== 'PATIENT') {
                return res.status(400).json({ success: false, message: 'A non-patient user with this email already exists.' });
            }

            // Ensure field is an array (migration safety)
            const hospitals = userExists.patientDetails.registeredByHospitals || [];
            
            if (hospitals.some(id => id.toString() === req.user._id.toString())) {
                return res.status(400).json({ success: false, message: 'Patient is already registered with your hospital.' });
            }

            // Add the new hospital
            userExists.patientDetails.registeredByHospitals = [...hospitals, req.user._id];

            // Retain old insurance coverage and limits if the provider and policy match
            let retainedInsuranceDetails = finalInsuranceDetails;
            if (userExists.patientDetails.insuranceDetails && finalInsuranceDetails) {
                const oldIns = userExists.patientDetails.insuranceDetails;
                const newIns = finalInsuranceDetails;

                // Check provider match (either standard providerId or customProviderName) AND policyNumber
                const isSameProvider = (oldIns.providerId && newIns.providerId && oldIns.providerId.toString() === newIns.providerId.toString()) 
                    || (oldIns.isCustomProvider && newIns.isCustomProvider && oldIns.customProviderName === newIns.customProviderName);
                const isSamePolicy = (oldIns.policyNumber && newIns.policyNumber && oldIns.policyNumber === newIns.policyNumber);

                if (isSameProvider && isSamePolicy) {
                    retainedInsuranceDetails = {
                        ...newIns,
                        coverageAmount: oldIns.coverageAmount,
                        balanceAmount: oldIns.balanceAmount,
                        validUpto: oldIns.validUpto || newIns.validUpto,
                        coverageBreakdown: oldIns.coverageBreakdown || newIns.coverageBreakdown,
                        insuranceDocuments: [...(oldIns.insuranceDocuments || []), ...(newIns.insuranceDocuments || [])]
                    };
                }
            }

            if (retainedInsuranceDetails) {
                 userExists.patientDetails.insuranceDetails = retainedInsuranceDetails;
            }
            
            userExists.markModified('patientDetails');
            await userExists.save();

            return res.status(200).json({
                success: true,
                message: 'Patient linked to your hospital successfully.',
                data: {
                    _id: userExists._id,
                    name: userExists.name,
                    email: userExists.email,
                }
            });
        }

        // Auto-generate a password for the patient to login with later
        const generatedPassword = generatePassword();

        const patient = await User.create({
            name,
            email,
            password: generatedPassword,
            role: 'PATIENT',
            patientDetails: {
                ...patientDetails,
                insuranceDetails: finalInsuranceDetails,
                registeredByHospitals: [req.user._id]
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
            'patientDetails.registeredByHospitals': req.user._id
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
            'patientDetails.registeredByHospitals': req.user._id
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found or not associated with this hospital' });
        }

        // Coverage Limit Validation
        const coverageLimit = Number(patient.patientDetails?.insuranceDetails?.coverageAmount) || 0;
        
        // Calculate mathematically remaining funds from previous claims
        const existingClaims = await Claim.find({ patientId });
        const totalUtilized = existingClaims
            .filter(c => ["Approved", "Amount Released"].includes(c.status))
            .reduce((acc, c) => acc + (c.approvedAmount || c.totalAmount || 0), 0);
            
        const availableBalance = Math.max(0, coverageLimit - totalUtilized);

        if (Number(totalAmount) > availableBalance) {
            return res.status(400).json({ 
                success: false, 
                message: `Claim amount (₹${Number(totalAmount).toLocaleString()}) exceeds the patient's available coverage balance (₹${availableBalance.toLocaleString()}).` 
            });
        }

        // Verify OTP
        const otpKey = `initiate_claim_${patientId}`;
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

        // OTP verified successfully. Clear it.
        otpStore.delete(otpKey);

        // Generate unique claim number
        const claimNumber = `CLM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // Document Verification Logic
        const requiredDocs = [
            'Claim Form', 'ID Proof', 'Policy Card',
            'Prescription', 'Discharge Summary', 'Pharmacy Bill',
            'Investigation Report', 'NEFT Details'
        ];
        
        // Final array of documents to attach
        let finalDocuments = documents ? [...documents] : [];
        const explicitlyProvidedDocs = finalDocuments.map(d => d.docType);

        // Auto-Attacher: Map vault types to claim required types
        const vaultToClaimMap = {
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

        // Scan Patient Vault (medicalHistory and insuranceDocuments)
        const patientInsuranceDocs = (patient.patientDetails?.insuranceDetails?.insuranceDocuments || []).map(doc => ({
            docType: 'Insurance Policy Copy',
            fileUrl: doc.fileUrl
        }));

        const patientVault = [
            ...(patient.patientDetails?.medicalHistory || []),
            ...patientInsuranceDocs
        ];

        patientVault.forEach(vaultDoc => {
            const mappedClaimDocType = vaultToClaimMap[vaultDoc.docType];

            // If the vault document matches a required claim doc and the hospital hasn't explicitly uploaded one
            if (mappedClaimDocType && !explicitlyProvidedDocs.includes(mappedClaimDocType)) {
                // Ensure we don't attach multiple of the same mapped type
                const alreadyAutoAttached = finalDocuments.find(d => d.docType === mappedClaimDocType);
                if (!alreadyAutoAttached) {
                    finalDocuments.push({
                        docType: mappedClaimDocType,
                        fileUrl: vaultDoc.fileUrl,
                        uploadedBy: req.user._id, // Assume hospital is attributing it
                        remarks: `Auto-attached from Patient Vault (${vaultDoc.docType})`,
                        received: true,
                        verified: true // Pre-verified if from system vault 
                    });
                }
            }
        });

        const providedDocs = finalDocuments.map(d => vaultToClaimMap[d.docType] || d.docType);
        const missingDocuments = requiredDocs.filter(reqDoc => !providedDocs.includes(reqDoc));

        // Determine Initial Status
        const initialStatus = missingDocuments.length === 0 ? 'Submitted' : 'Pending Documents';
        const initialComment = missingDocuments.length === 0 
           ? 'Claim drafted and fully verified (including Vault docs). Submitted to Insurance.' 
           : `Claim drafted but awaiting mandatory documents: ${missingDocuments.join(', ')}`;

        const claim = await Claim.create({
            claimNumber,
            patientId,
            hospitalId: req.user._id,
            insuranceCompanyId,
            totalAmount,
            status: initialStatus,
            documents: finalDocuments,
            history: [
                {
                    status: initialStatus,
                    updatedBy: req.user._id,
                    comment: initialComment
                }
            ]
        });

        // In a real app, trigger 'Claim Processing Agent' via event broker / HTTP call here

        // Send email to custom insurer if applicable
        if (patient.patientDetails?.insuranceDetails?.isCustomProvider) {
            const { customProviderEmail, customProviderName, policyNumber } = patient.patientDetails.insuranceDetails;
            if (customProviderEmail) {
                // Fire-and-forget email dispatch
                sendCustomInsurerNotification(
                    customProviderEmail,
                    customProviderName || "Custom Provider",
                    patient.name,
                    req.user.name || "MediClaim Hospital",
                    claimNumber,
                    policyNumber || "N/A"
                ).catch(err => console.error("Failed to send Custom Insurer notification:", err));
            }
        }

        res.status(201).json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP to patient email and phone for claim initiation consent
// @route   POST /api/hospitals/patients/:id/send-consent-otp
// @access  Private/Hospital
export const sendClaimInitiationOTP = async (req, res) => {
    try {
        const patientId = req.params.id;

        const patient = await User.findOne({
            _id: patientId,
            role: 'PATIENT',
            'patientDetails.registeredByHospitals': req.user._id
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
        const emailResult = await sendOTPEmail(patient.email, otp);
        const { phoneNumber } = patient.patientDetails;
        
        let smsResult = { success: true }; // Mock success if no phone provided, though it should be
        if (phoneNumber) {
            smsResult = await sendOTPSMS(phoneNumber, otp);
        } else {
             console.warn(`[SMS Service] No phone number found for patient ${patientId}`);
        }

        if (!emailResult.success || !smsResult.success) {
            console.warn("OTP delivery failed for one or more channels, but proceeding in dev environment. See console for OTP.");
        }

        res.json({ success: true, message: "Consent OTP sent successfully to patient's email and phone" });
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
            filter.status = { $nin: ['Pending Documents', 'Pending Patient Consent', 'Initiated'] };
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
        if (req.user.role === 'INSURANCE') {
            if (claim.insuranceCompanyId._id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
            if (['Pending Documents', 'Pending Patient Consent', 'Initiated'].includes(claim.status)) {
                return res.status(404).json({ success: false, message: 'Claim not found or not yet submitted' });
            }
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

// @desc    Send OTP to patient for Hospital withdrawing a claim
// @route   POST /api/hospitals/claims/:id/send-withdraw-otp
// @access  Private/Hospital
export const sendHospitalWithdrawOTP = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, hospitalId: req.user._id }).populate('patientId');

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (['Approved', 'Rejected', 'Withdrawn', 'Amount Released'].includes(claim.status)) {
            return res.status(400).json({ success: false, message: `Cannot withdraw a claim that is already ${claim.status}.` });
        }

        const patient = claim.patientId;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(`withdraw_${claim._id}_${patient._id}`, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
        await sendOTPEmail(patient.email, otp);

        res.json({ success: true, message: "Withdrawal OTP sent to the patient's registered email." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Withdraw claim using Patient OTP (Hospital perspective)
// @route   PUT /api/hospitals/claims/:id/withdraw
// @access  Private/Hospital
export const hospitalWithdrawClaim = async (req, res) => {
    try {
        const { otp } = req.body;
        const claim = await Claim.findOne({ _id: req.params.id, hospitalId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        const patientId = claim.patientId;
        const otpKey = `withdraw_${claim._id}_${patientId}`;
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
            comment: 'Hospital withdrew the claim successfully after explicit Patient OTP consent.'
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new Doctor Slot
// @route   POST /api/hospitals/slots
// @access  Private/Hospital
export const addDoctorSlot = async (req, res) => {
    try {
        const { doctorName, specialty, date, time, maxSlots } = req.body;

        const slot = await DoctorSlot.create({
            hospitalId: req.user._id,
            doctorName,
            specialty,
            date,
            time,
            maxSlots: maxSlots || 1
        });

        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        // Handle unique constraint error
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This specific doctor slot already exists.' });
        }
        console.error("SLOT CREATION ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all Doctor Slots for this hospital
// @route   GET /api/hospitals/slots
// @access  Private/Hospital
export const getHospitalSlots = async (req, res) => {
    try {
        const slots = await DoctorSlot.find({ hospitalId: req.user._id })
            .sort({ date: 1, time: 1 })
            .populate('bookedPatients.patientId', 'name email');

        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a completely registered patient's details
// @route   PUT /api/hospitals/patients/:id
// @access  Private/Hospital
export const updatePatientDetails = async (req, res) => {
    try {
        const { status, nextCheckupDate, criticalAlert, insuranceDetails } = req.body;

        const patient = await User.findOne({ _id: req.params.id, role: 'PATIENT' });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // We could enforce that the hospital updating is the hospital who registered them
        if (patient.patientDetails.registeredByHospitals && 
            !patient.patientDetails.registeredByHospitals.some(id => id.toString() === req.user._id.toString())) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this patient' });
        }

        if (status) patient.patientDetails.status = status;
        
        // Let it be cleared optionally if undefined, but usually handled from frontend
        if (nextCheckupDate !== undefined) {
             patient.patientDetails.nextCheckupDate = nextCheckupDate;
        }

        if (criticalAlert !== undefined) {
             patient.patientDetails.criticalAlert = criticalAlert;
        }

        // Retrospective Insurance Linkage
        if (insuranceDetails) {
             patient.patientDetails.insuranceDetails = insuranceDetails;
        }

        await patient.save();

        res.json({ success: true, data: patient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get hospital analytics dashboard widgets
// @route   GET /api/hospitals/analytics
// @access  Private/Hospital
export const getHospitalAnalytics = async (req, res) => {
    try {
        const claims = await Claim.find({ hospitalId: req.user._id });
        const patients = await User.find({ role: 'PATIENT', 'patientDetails.registeredByHospitals': req.user._id });

        // Calculate Authentic Monthly Admissions cleanly trailing 5 months
        const monthlyAdmissions = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const today = new Date();
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthlyCount = patients.filter(p => {
                const pd = new Date(p.createdAt || Date.now());
                return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
            }).length;
            monthlyAdmissions.push({ month: monthNames[d.getMonth()], patients: monthlyCount });
        }

        // Calculate Claim Distribution exact numbers
        const approvedCount = claims.filter(c => c.status === 'Approved').length;
        const rejectedCount = claims.filter(c => c.status === 'Rejected').length;
        const pendingCount = claims.filter(c => c.status !== 'Approved' && c.status !== 'Rejected' && c.status !== 'Withdrawn').length;

        const claimDistribution = [
            { name: "Approved", value: approvedCount > 0 ? approvedCount : 1 }, // Fallback to 1 so chart isn't empty if 0
            { name: "Pending", value: pendingCount > 0 ? pendingCount : 1 },
            { name: "Rejected", value: rejectedCount }
        ];

        res.json({
            success: true,
            data: {
                totalPatients: patients.length,
                activeClaims: pendingCount,
                monthlyAdmissions,
                claimDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload document direct to a patient profile (Hospital action)
// @route   POST /api/hospitals/patients/:id/documents
// @access  Private/Hospital
export const uploadPatientDocument = async (req, res) => {
    try {
        const patientId = req.params.id;
        const { docType } = req.body;

        if (!docType || !req.file) {
            return res.status(400).json({ success: false, message: 'Missing document parameters or file' });
        }

        const patient = await User.findOne({ _id: patientId, role: 'PATIENT', 'patientDetails.registeredByHospitals': req.user._id });
        if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

        // Build the public URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newDoc = {
            docType,
            fileUrl,
            uploadedDate: new Date()
        };

        patient.patientDetails.medicalHistory.push(newDoc);
        await patient.save();

        res.json({ success: true, message: 'Document added to patient record', data: newDoc });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload additional document to a drafted/pending claim (Hospital side)
// @route   PUT /api/hospitals/claims/:id/documents
// @access  Private/Hospital
export const uploadMissingDocumentHospital = async (req, res) => {
    try {
        const { docType } = req.body;
        
        if (!docType || !req.file) {
            return res.status(400).json({ success: false, message: 'Missing document type or file' });
        }

        const claim = await Claim.findOne({ _id: req.params.id, hospitalId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found or unauthorized' });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        claim.documents.push({
            docType,
            fileUrl,
            uploadedBy: req.user._id,
            remarks: `Uploaded by hospital to supplement claim`
        });

        claim.history.push({
            status: claim.status,
            updatedBy: req.user._id,
            comment: `Hospital uploaded supplemental document: ${docType}`
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
                comment: 'All mandatory documents verified. Claim officially submitted and sent to insurer.'
            });
        }

        await claim.save();
        res.json({ success: true, message: 'Document added to claim', data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
