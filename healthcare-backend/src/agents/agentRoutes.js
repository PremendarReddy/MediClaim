import express from 'express';
import Claim from '../models/Claim.js';
import User from '../models/User.js';
import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';

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
        const { claimId } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "Groq API key is missing. Cannot perform AI analysis." });
        }

        const claim = await Claim.findById(claimId).populate('patientId');
        if (!claim) return res.status(404).json({ error: "Claim not found" });

        const patient = claim.patientId;
        const uploadCount = claim.documents?.length || 0;
        const totalAmount = claim.totalAmount;
        
        let age = "Unknown";
        if (patient?.patientDetails?.dateOfBirth) {
            const dob = new Date(patient.patientDetails.dateOfBirth);
            age = new Date().getFullYear() - dob.getFullYear();
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const systemPrompt = `You are a medical insurance fraud and risk assessment AI. Analyze the following claim data and determine the risk level. You MUST return ONLY a valid JSON object matching the requested schema. Do NOT wrap the JSON in markdown blocks or return any conversational text whatsoever. Wait, strictly follow the JSON object requirement.

Data:
- Patient Age: ${age}
- Claim Request Amount (INR): ${totalAmount}
- Attached Documents Count: ${uploadCount}

Schema required:
{
  "riskLevel": "LOW", // MUST BE "LOW", "MEDIUM", or "HIGH"
  "explanation": "A concise 1-2 sentence explanation of why this risk level was assigned based on the data points provided."
}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

        claim.aiRiskScore = aiResponse.riskLevel;
        claim.aiRiskExplanation = aiResponse.explanation;
        await claim.save();

        res.json({
            agent: "Fraud & Risk Detection Agent",
            riskLevel: aiResponse.riskLevel,
            explanations: [aiResponse.explanation],
            recommendation: aiResponse.riskLevel === 'HIGH' ? 'Manual Investigation Required' : 'Auto-Approve Eligible'
        });
    } catch (error) {
        console.error("AI Fraud Detection Error:", error);
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
        const omniContext = contextData || "No context data provided.";

        let sysInstruction = `You are the Nexus Healthcare Omni-Agent. You have access to a Master Context JSON payload containing the User's active Insurance Policy, their Claim Histories, and their Vaulted Documents. You are highly intelligent and can answer any cross-domain question seamlessly using this data. Even if the user is currently focused on one topic, ALWAYS use the provided context to answer their query accurately if applicable.\n\nMaster Context Payload:\n"""\n${omniContext}\n"""\n\n`;

        switch (mode) {
            case "claims":
                sysInstruction += "Your primary conversational persona for this interaction is the Claims Support Assistant. Guide them on next steps for their active claims or required documents.";
                break;
            case "medical":
                sysInstruction += "Your primary conversational persona for this interaction is an empathetic Medical AI Chat Agent. Advise the user on preliminary remedies for their symptoms, but ALWAYS conclude your advice by reminding them to consult a registered healthcare professional.";
                break;
            case "document":
                sysInstruction += "Your primary conversational persona for this interaction is a Medical Document Analyzer. Accurately answer their questions about the files inside their documentsData payload.";
                break;
            case "policy":
            default:
                sysInstruction += "Your primary conversational persona for this interaction is an Insurance Agent Assistant. Use the policyData block to answer questions regarding coverage and provider limits.";
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
