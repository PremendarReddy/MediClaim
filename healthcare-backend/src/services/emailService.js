import nodemailer from 'nodemailer';

// Create a reusable transporter using SMTP transporter
// For production, configure these in .env
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com', // fallback to gmail for dev
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Send an OTP Email
 * @param {string} email - The recipient email
 * @param {string} otp - The 6 digit OTP code
 */
export const sendOTPEmail = async (email, otp) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`[MOCK EMAIL] OTP for ${email}: ${otp}`);
            return { success: true, mock: true };
        }

        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: `"MediClaim Support" <${process.env.SMTP_USER}>`, 
            to: email,
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
        });

        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send OTP email via Nodemailer:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Send Welcome Email with Auto-Generated Password
 * @param {string} email - The recipient email
 * @param {string} hospitalName - The name of the hospital registering them
 * @param {string} tempPassword - The auto-generated password
 */
export const sendWelcomeEmail = async (email, hospitalName, tempPassword) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`[MOCK EMAIL] Welcome ${email} registered by ${hospitalName}. Password: ${tempPassword}`);
            return { success: true, mock: true };
        }

        const transporter = createTransporter();

        const info = await transporter.sendMail({
            from: `"MediClaim Support" <${process.env.SMTP_USER}>`,
            to: email,
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
        });

        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send Welcome email via Nodemailer:', err);
        return { success: false, error: err.message };
    }
};
