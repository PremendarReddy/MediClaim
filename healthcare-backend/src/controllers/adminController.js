import Claim from '../models/Claim.js';
import User from '../models/User.js';
import { simulateRiskScore } from '../services/utils.js';

// @desc    Get all claims assigned to this insurance company
// @route   GET /api/admin/claims
// @access  Private/Insurance
export const getInsuranceClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ insuranceCompanyId: req.user._id })
            .populate('patientId', 'name email patientDetails')
            .populate('hospitalId', 'name email hospitalDetails')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: claims.length, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update claim status (Approve, Reject, Request Docs)
// @route   PUT /api/admin/claims/:id/status
// @access  Private/Insurance
export const updateClaimStatus = async (req, res) => {
    try {
        const { status, comment, approvedAmount } = req.body;

        if (status === 'Rejected' && (!comment || comment.trim() === '')) {
            return res.status(400).json({ success: false, message: 'A reason for rejection is mandatory.' });
        }

        const claim = await Claim.findOne({ _id: req.params.id, insuranceCompanyId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found or unauthorized' });
        }

        claim.status = status;

        if (status === 'Approved' && approvedAmount) {
            claim.approvedAmount = approvedAmount;
        }

        claim.history.push({
            status,
            updatedBy: req.user._id,
            comment: comment || `Status updated to ${status}`
        });

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update specific document verification status
// @route   PUT /api/admin/claims/:id/documents/:docId/status
// @access  Private/Insurance
export const verifyDocument = async (req, res) => {
    try {
        const { received, verified } = req.body;

        const claim = await Claim.findOne({ _id: req.params.id, insuranceCompanyId: req.user._id });

        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found or unauthorized' });
        }

        const document = claim.documents.id(req.params.docId);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        if (received !== undefined) document.received = received;
        if (verified !== undefined) document.verified = verified;

        await claim.save();

        res.json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Trigger AI Risk Analysis on a claim
// @route   POST /api/admin/claims/:id/analyze
// @access  Private/Insurance
export const analyzeClaimRisk = async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, insuranceCompanyId: req.user._id })
            .populate('patientId');

        if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

        // Use the simulated model
        const patientAge = claim.patientId.patientDetails?.dateOfBirth ?
            new Date().getFullYear() - new Date(claim.patientId.patientDetails.dateOfBirth).getFullYear()
            : 45; // Default age

        const riskEvaluation = simulateRiskScore(patientAge, claim.totalAmount, 'NORMAL');

        claim.aiRiskScore = riskEvaluation.level;
        claim.aiRiskExplanation = riskEvaluation.explanation;

        await claim.save();

        res.json({
            success: true,
            data: { score: claim.aiRiskScore, rationale: claim.aiRiskExplanation }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Dashboard Analytics for Insurance Admin
// @route   GET /api/admin/analytics
// @access  Private/Insurance
export const getAdminAnalytics = async (req, res) => {
    try {
        const companyId = req.user._id;

        const totalClaims = await Claim.countDocuments({ insuranceCompanyId: companyId });
        const pendingClaims = await Claim.countDocuments({ insuranceCompanyId: companyId, status: { $in: ['Submitted', 'Under Review'] } });
        const approvedClaims = await Claim.countDocuments({ insuranceCompanyId: companyId, status: 'Approved' });
        const rejectedClaims = await Claim.countDocuments({ insuranceCompanyId: companyId, status: 'Rejected' });

        const highRiskClaims = await Claim.countDocuments({ insuranceCompanyId: companyId, aiRiskScore: 'HIGH' });

        res.json({
            success: true,
            data: {
                totalClaims,
                pendingClaims,
                approvedClaims,
                rejectedClaims,
                highRiskClaims
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
