import express from 'express';
import Claim from '../models/Claim.js';
import User from '../models/User.js';

const router = express.Router();

// A central orchestrator for Agent APIs to respond back in structured JSON as requested

// -------------------------------------------------------------
// AGENT 1: Claim Processing Agent
// Manages the lifecycle and validates data before forwarding
// -------------------------------------------------------------
router.post('/agent/process-claim', async (req, res) => {
    try {
        const { claimId } = req.body;
        const claim = await Claim.findById(claimId).populate('patientId');

        if (!claim) return res.status(404).json({ error: "Claim not found" });

        // AI Check: Is the claim amount valid vs coverage?
        const coverageAmount = claim.patientId.patientDetails?.insuranceDetails?.coverageAmount || 0;

        let aiStatus = 'VALIDATED';
        let recommendations = [];

        if (claim.totalAmount > coverageAmount && coverageAmount > 0) {
            aiStatus = 'FLAGGED';
            recommendations.push("Claim amount exceeds patient's known coverage limits.");
        }

        if (claim.documents.length === 0) {
            aiStatus = 'FLAGGED';
            recommendations.push("No documents attached to claim.");
        }

        res.json({
            agent: "Claim Processing Agent",
            claimId: claim._id,
            aiStatus,
            recommendations,
            nextStage: aiStatus === 'VALIDATED' ? 'Pending Patient Consent' : 'Requires Hospital Review'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------------------------------------------
// AGENT 2: Document Verification Agent
// Verifies required documents and identifies missing ones
// -------------------------------------------------------------
router.post('/agent/verify-documents', async (req, res) => {
    try {
        const { claimId } = req.body;
        const claim = await Claim.findById(claimId);

        if (!claim) return res.status(404).json({ error: "Claim not found" });

        const requiredDocs = [
            'Claim Form', 'ID Proof', 'Policy Card',
            'Prescription', 'Discharge Summary', 'Pharmacy Bill',
            'Investigation Report', 'NEFT Details'
        ];

        const uploadedDocTypes = claim.documents.map(d => d.docType);

        const missingDocuments = requiredDocs.filter(doc => !uploadedDocTypes.includes(doc));
        const isComplete = missingDocuments.length === 0;

        res.json({
            agent: "Document Verification Agent",
            claimId: claim._id,
            isComplete,
            uploadedCount: claim.documents.length,
            missingDocuments,
            actionRequired: isComplete ? "None" : "Notify Hospital/Patient to upload missing documents"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------------------------------------------
// AGENT 3: Medical Insight Agent
// Analyzes reports and extracts medical metrics (Simulated NLP)
// -------------------------------------------------------------
router.post('/agent/medical-insights', async (req, res) => {
    try {
        const { reportText } = req.body;

        // Simulated NLP Extraction based on text content
        const containsKeyword = (word) => reportText.toLowerCase().includes(word);

        let diagnosis = "General Analysis";
        let riskFactor = "Normal";
        let summary = "Patient report indicates standard vitals. No immediate critical action flagged.";

        if (containsKeyword("diabetes") || containsKeyword("glucose")) {
            diagnosis = "Endocrinology / Diabetes";
            summary = "Report flags elevated blood glucose levels. Prescribed insulin or metabolic management recommended.";
        }

        if (containsKeyword("cardio") || containsKeyword("heart")) {
            diagnosis = "Cardiology";
            riskFactor = "High";
            summary = "Report indicates cardiovascular irregularities. Immediate follow-up with a cardiologist is recommended.";
        }

        res.json({
            agent: "Medical Insight Agent",
            diagnosis,
            riskFactor,
            aiSummary: summary,
            extractedMetrics: {
                keywordsFound: ["blood", "pressure", "glucose"].filter(containsKeyword)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------------------------------------------
// AGENT 4: Fraud & Risk Detection Agent
// ML Risk Analysis based on billing patterns and history
// -------------------------------------------------------------
router.post('/agent/fraud-detection', async (req, res) => {
    try {
        const { age, claimAmount, previousClaimsCount } = req.body;

        // Simulated ML Random Forest Logic
        let riskScore = 0;
        let explanations = [];

        if (age < 30 && claimAmount > 500000) {
            riskScore += 40;
            explanations.push("Unusually high claim amount for age demographic.");
        }

        if (previousClaimsCount > 3) {
            riskScore += 30;
            explanations.push("High frequency of claims detected.");
        }

        if (claimAmount > 1000000) {
            riskScore += 30;
            explanations.push("Claim amount exceeds 10L threshold.");
        }

        let riskLevel = 'LOW';
        if (riskScore >= 70) riskLevel = 'HIGH';
        else if (riskScore >= 40) riskLevel = 'MEDIUM';

        res.json({
            agent: "Fraud & Risk Detection Agent",
            riskLevel,
            riskScoreMetric: riskScore,
            explanations,
            recommendation: riskLevel === 'HIGH' ? 'Manual Investigation Required' : 'Auto-Approve Eligible'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------------------------------------------
// AGENT 5: Insurance Coverage Agent
// Extract policy info via NLP and answer patient questions
// -------------------------------------------------------------
router.post('/agent/coverage-analysis', async (req, res) => {
    try {
        const { policyText, query } = req.body;

        // Simulated NLP Policy Extraction
        const isMaternityCovered = policyText.toLowerCase().includes("maternity");
        const isDentalCovered = policyText.toLowerCase().includes("dental");
        const limitMatch = policyText.match(/limit.*\$?(\d+[,0-9]*)/i);
        const limit = limitMatch ? limitMatch[1] : "Standard";

        let queryAnswer = "I'm sorry, I couldn't find an answer to that in your policy.";

        if (query && query.toLowerCase().includes("maternity")) {
            queryAnswer = isMaternityCovered ? "Yes, your policy covers maternity treatments." : "No, maternity is excluded.";
        } else if (query && query.toLowerCase().includes("limit")) {
            queryAnswer = `Your coverage limit mentioned is ${limit}.`;
        }

        res.json({
            agent: "Insurance Coverage Agent",
            coverageSummary: {
                maternity: isMaternityCovered ? "Covered" : "Excluded",
                dental: isDentalCovered ? "Covered" : "Excluded",
                estimatedLimit: limit
            },
            patientQuery: query || null,
            queryAnswer: query ? queryAnswer : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
