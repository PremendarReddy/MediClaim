import express from 'express';
import Claim from '../models/Claim.js';
import User from '../models/User.js';
import { GoogleGenAI, Type } from '@google/genai';

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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing. Cannot perform real AI analysis." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `You are an expert Doctor AI. Read the following medical report text and extract the required information in a strictly structured format.
        
Report Text:
"""
${reportText}
"""`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    description: "Structured medical consensus extracted from the report",
                    properties: {
                        diagnosis: {
                            type: Type.STRING,
                            description: "The primary medical diagnosis or body system affected, e.g., 'Cardiology' or 'Endocrinology / Diabetes'. Limit to 3 words."
                        },
                        riskFactor: {
                            type: Type.STRING,
                            description: "The risk level of the patient based on the report.",
                            enum: ["LOW", "MEDIUM", "HIGH"]
                        },
                        aiSummary: {
                            type: Type.STRING,
                            description: "A 2-3 sentence summary explaining the key findings and why the risk factor was chosen."
                        },
                        extractedMetrics: {
                            type: Type.OBJECT,
                            properties: {
                                keywordsFound: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "A list of 3-5 critical medical keywords or indicators found in the text."
                                }
                            }
                        }
                    },
                    required: ["diagnosis", "riskFactor", "aiSummary", "extractedMetrics"]
                }
            }
        });

        const jsonAnalysis = JSON.parse(response.text);

        res.json({
            agent: "Medical Insight Agent",
            ...jsonAnalysis
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
        const { claimId, age, claimAmount, previousClaimsCount } = req.body;

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

        // Synchronize analysis inference natively back to the Claim if ID was provided
        if (claimId) {
             const claim = await Claim.findById(claimId);
             if (claim) {
                 claim.aiRiskScore = riskLevel;
                 claim.aiRiskExplanation = explanations.join(" | ");
                 await claim.save();
             }
        }

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

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing. Cannot perform real AI analysis." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = query || "Please summarize my policy briefly.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are an expert Insurance Agent Assistant. Use the following patient insurance policy to answer their questions accurately and concisely. If the policy text doesn't explicitly answer their question, state that you cannot find the answer in the provided policy.
                
Policy Text:
"""
${policyText || "No policy text provided."}
"""`
            }
        });

        res.json({
            agent: "Insurance Coverage Agent",
            patientQuery: query || null,
            queryAnswer: response.text
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// -------------------------------------------------------------
// AGENT: Multi-Mode Intelligent Chat
// Provide dynamic system instructions based on chat intent
// -------------------------------------------------------------
router.post('/agent/general-chat', async (req, res) => {
    try {
        const { mode, query, contextData } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is missing. Cannot perform real AI analysis." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        let sysInstruction = "";

        switch (mode) {
            case "claims":
                sysInstruction = `You are a Claims Support Assistant. Use the provided active claims data (JSON) to answer the user's questions about their claim status, required documents, and next steps accurately and concisely. If the user asks for details not present in their claims, state that you cannot find the answer based on their current records.\n\nClaims Data:\n"""\n${contextData || "No claims data provided."}\n"""`;
                break;
            case "medical":
                sysInstruction = "You are an empathetic Medical AI Chat Agent. Advise the user on preliminary remedies for their symptoms, explain what specific tablets/medications are used for, and guide them on when to take them based on standard medical knowledge. ALWAYS conclude your advice by reminding the user to consult a registered healthcare professional or physician, as you are an AI assistant, not a doctor.";
                break;
            case "document":
                sysInstruction = `You are a Medical Document Analyzer. Use the provided document text to accurately answer the user's questions about their lab results, prescriptions, or discharge summaries.\n\nDocument Text:\n"""\n${contextData || "No document provided."}\n"""`;
                break;
            case "policy":
            default:
                sysInstruction = `You are an expert Insurance Agent Assistant. Use the attached patient insurance policy to answer their coverage questions accurately and concisely. If the policy text doesn't explicitly answer their question, state that you cannot find the answer in the provided policy.\n\nPolicy Text:\n"""\n${contextData || "No policy text provided."}\n"""`;
                break;
        }

        const prompt = query || (mode === 'medical' ? "Hello, how can I help you regarding your symptoms?" : "Please summarize my information.");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: sysInstruction
            }
        });

        res.json({
            success: true,
            mode: mode,
            queryAnswer: response.text
        });
    } catch (error) {
        console.error("General Chat Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
