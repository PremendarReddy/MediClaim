import twilio from 'twilio';

/**
 * Send an OTP SMS via Twilio
 * @param {string} phoneNumber - The recipient phone number
 * @param {string} otp - The 6 digit OTP code
 */
export const sendOTPSMS = async (phoneNumber, otp) => {
    try {
        if (
            !process.env.TWILIO_ACCOUNT_SID ||
            !process.env.TWILIO_AUTH_TOKEN ||
            !process.env.TWILIO_PHONE_NUMBER
        ) {
            console.log(`[MOCK SMS] OTP for ${phoneNumber}: ${otp}`);
            return { success: true, mock: true };
        }

        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // Twilio requires phone numbers to be in E.164 format. 
        // We will try our best to format it assuming it's an Indian number if no country code is provided.
        // A robust app should enforce E.164 at the input level.
        let formattedPhone = phoneNumber.trim();
        if (!formattedPhone.startsWith('+')) {
            // Assume India +91 if not specified for this specific local test, ideally enforce in UI
            if (formattedPhone.length === 10) {
                formattedPhone = '+91' + formattedPhone;
            } else {
                 console.warn(`[SMS Service] Phone number ${formattedPhone} might not be in E.164 format. Attempting anyway...`);
            }
        }

        const message = await client.messages.create({
            body: `Your MediClaim Verification Code is: ${otp}. This code is valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log(`[SMS Service] Sent to ${formattedPhone}, SID: ${message.sid}`);
        return { success: true, sid: message.sid };

    } catch (err) {
        console.error('Failed to send OTP SMS:', err);
        return { success: false, error: err.message };
    }
};
