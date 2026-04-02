import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';

/**
 * Analyzes an uploaded insurance document using Gemini and extracts key details.
 * @param {string} filePath - The path to the uploaded file.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<Object>} The extracted insurance details (coverageAmount, validUpto, providerName, policyNumber, isValid).
 */
export const analyzeInsuranceDocument = async (filePath, mimeType) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("Gemini API key is missing. Skipping actual AI analysis.");
            return null;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Read the file as a base64 string
        const fileBytes = fs.readFileSync(filePath).toString("base64");

        const prompt = `You are an expert Medical Insurance Assessor. I am providing you an image or PDF of a patient's health insurance card or policy document. Please analyze the document and extract the following details precisely.
        
If a field is not present or cannot be confidently detected, return null for that field.

Fields to extract:
1. coverageAmount (Number): The total coverage/sum insured amount available. Try to parse it as an exact integer (e.g. 500000).
2. validUpto (String): The expiration or valid-upto date of the policy in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
3. providerName (String): The name of the insurance company.
4. policyNumber (String): The policy number or member ID.
5. isValid (Boolean): True if the policy appears currently active and valid, false otherwise (based on dates).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: fileBytes,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    description: "Extracted insurance policy details",
                    properties: {
                        coverageAmount: { type: Type.NUMBER, description: "Total coverage amount. Null if not found." },
                        validUpto: { type: Type.STRING, description: "Expiration date in ISO format. Null if not found." },
                        providerName: { type: Type.STRING, description: "Name of the insurance provider. Null if not found." },
                        policyNumber: { type: Type.STRING, description: "Policy or Member ID number. Null if not found." },
                        isValid: { type: Type.BOOLEAN, description: "Is the policy actively valid? True/False." }
                    }
                }
            }
        });

        const extractedData = JSON.parse(response.text);
        return extractedData;

    } catch (error) {
        console.error("AI Document Analysis Failed:", error);
        return null;
    }
};
