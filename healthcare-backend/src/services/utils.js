export const generatePassword = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const passwordLength = 10;
    let password = "";
    for (let i = 0; i <= passwordLength; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
};

// Simulated Random Forest ML Model for Risk Scoring
export const simulateRiskScore = (patientAge, claimAmount, diagnosisLevel) => {
    let riskScore = 0;

    if (patientAge > 65) riskScore += 30;
    if (patientAge > 80) riskScore += 20;

    if (claimAmount > 500000) riskScore += 40; // > 5L
    else if (claimAmount > 200000) riskScore += 20; // > 2L

    // High diagnosis means severe illness
    if (diagnosisLevel === 'CRITICAL') riskScore += 30;

    if (riskScore >= 70) return { level: 'HIGH', explanation: 'High claim amount and age factor detected.' };
    if (riskScore >= 40) return { level: 'MEDIUM', explanation: 'Moderate claim values requiring manual review.' };

    return { level: 'LOW', explanation: 'Standard claim metrics, automated approval recommended.' };
};
