import api from '../api/axios';

// -------------------------------------------------------------
// AGENT 1: Claim Processing Agent
// Manages the lifecycle and validates data before forwarding
// -------------------------------------------------------------
export const processClaim = async (claimId) => {
    try {
        const response = await api.post('/agent/process-claim', { claimId });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Agent 1 failed' };
    }
};

// -------------------------------------------------------------
// AGENT 2: Document Verification Agent
// Verifies required documents and identifies missing ones
// -------------------------------------------------------------
export const verifyDocuments = async (claimId) => {
    try {
        const response = await api.post('/agent/verify-documents', { claimId });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Agent 2 failed' };
    }
};

// -------------------------------------------------------------
// AGENT 3: Medical Insight Agent
// Analyzes reports and extracts medical metrics (Simulated NLP)
// -------------------------------------------------------------
export const getMedicalInsights = async (reportText) => {
    try {
        const response = await api.post('/agent/medical-insights', { reportText });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Agent 3 failed' };
    }
};

// -------------------------------------------------------------
// AGENT 4: Fraud & Risk Detection Agent
// ML Risk Analysis based on billing patterns and history
// -------------------------------------------------------------
export const runFraudDetection = async (age, claimAmount, previousClaimsCount) => {
    try {
        const response = await api.post('/agent/fraud-detection', { age, claimAmount, previousClaimsCount });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Agent 4 failed' };
    }
};

// -------------------------------------------------------------
// AGENT 5: Insurance Coverage Agent
// Extract policy info via NLP and answer patient questions
// -------------------------------------------------------------
export const analyzeCoverage = async (policyText, query) => {
    try {
        const response = await api.post('/agent/coverage-analysis', { policyText, query });
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Agent 5 failed' };
    }
};
