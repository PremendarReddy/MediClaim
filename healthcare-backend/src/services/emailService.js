import sgMail from '@sendgrid/mail';

const getSGClient = () => {
    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
    return sgMail;
};

// Requires a Sendgrid verified Sender Identity
const getFromEmail = () => process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'noreply@mediclaim.com';

const sendEmailBase = async (msg) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            console.log(`[MOCK SENDGRID] To: ${msg.to} | Subject: ${msg.subject}`);
            return { success: true, mock: true };
        }
        const client = getSGClient();
        const response = await client.send(msg);
        return { success: true, messageId: response[0]?.headers['x-message-id'] || 'sg-success' };
    } catch (error) {
        console.error('Failed to send email via SendGrid:', error);
        if (error.response && error.response.body) {
            console.error("SendGrid API Error body:", JSON.stringify(error.response.body, null, 2));
        }
        return { success: false, error: error.message };
    }
};

/**
 * Send an OTP Email
 * @param {string} email - The recipient email
 * @param {string} otp - The 6 digit OTP code
 */
export const sendOTPEmail = async (email, otp) => {
    const msg = {
        to: email,
        from: getFromEmail(),
        subject: 'Your MediClaim Verification Code',
        html: `
            <div style="font-family: sans-serif; padding: 20px; text-align: center; background-color: #f8fafc; border-radius: 12px;">
                <h2 style="color: #1e293b;">MediClaim Verification</h2>
                <p style="color: #475569; font-size: 16px;">Please use the following 6-digit code to verify your identity:</p>
                <div style="margin: 30px auto; padding: 20px; background-color: #ffffff; border: 2px dashed #cbd5e1; border-radius: 12px; max-width: 300px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.5em; color: #2563eb;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
        `,
    };

    return await sendEmailBase(msg);
};

/**
 * Send Welcome Email with Auto-Generated Password
 * @param {string} email - The recipient email
 * @param {string} hospitalName - The name of the hospital registering them
 * @param {string} tempPassword - The auto-generated password
 */
export const sendWelcomeEmail = async (email, hospitalName, tempPassword) => {
    const msg = {
        to: email,
        from: getFromEmail(),
        subject: 'Welcome to MediClaim - Your Account Details',
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
                <h2 style="color: #1e293b; text-align: center;">Welcome to MediClaim</h2>
                <p style="color: #475569; font-size: 16px; text-align: center;">Your secure patient profile has been created by <strong>${hospitalName}</strong>.</p>
                
                <div style="margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px;">
                    <p style="font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Your Login Credentials</p>
                    <p style="color: #334155; margin-bottom: 4px;"><strong>Portal:</strong> <a href="#">mediclaim-portal.com</a></p>
                    <p style="color: #334155; margin-bottom: 4px;"><strong>Email:</strong> ${email}</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
                    <p style="color: #334155; margin-bottom: 4px;"><strong>Temporary Password:</strong></p>
                    <div style="background-color: #f1f5f9; padding: 12px; text-align: center; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px;">
                        <span style="font-family: monospace; font-size: 20px; font-weight: bold; color: #0f172a;">${tempPassword}</span>
                    </div>
                </div>
                
                <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">For your security, please log in and change this password immediately.</p>
            </div>
        `,
    };

    return await sendEmailBase(msg);
};

/**
 * Send Action Required Email to Custom External Insurance Providers
 * @param {string} email - The external insurer email
 * @param {string} insurerName - Name of the custom insurer
 * @param {string} patientName - Name of the registered patient
 * @param {string} hospitalName - Requesting hospital name
 * @param {string} claimNumber - The newly generated MediClaim ID
 * @param {string} policyNumber - The patient's policy identifier
 */
export const sendCustomInsurerNotification = async (email, insurerName, patientName, hospitalName, claimNumber, policyNumber) => {
    const msg = {
        to: email,
        from: getFromEmail(),
        subject: `Action Required: New MediClaim Initiated for ${patientName}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
                <h2 style="color: #1e293b;">MediClaim Verification Request</h2>
                <p style="color: #475569; font-size: 16px;">Dear <strong>${insurerName}</strong>,</p>
                <p style="color: #475569; font-size: 16px;">A new health insurance claim has been initiated by <strong>${hospitalName}</strong> for your policyholder <strong>${patientName}</strong>.</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <p style="color: #334155; margin-bottom: 4px;"><strong>Claim Number:</strong> ${claimNumber}</p>
                    <p style="color: #334155; margin-bottom: 4px;"><strong>Policy Number:</strong> ${policyNumber}</p>
                </div>

                <p style="color: #475569; font-size: 14px;">Please log in to your external provider dashboard or contact the hospital directly to process this verification.</p>
            </div>
        `,
    };

    return await sendEmailBase(msg);
};
