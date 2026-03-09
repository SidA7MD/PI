const OTP = require('../models/OTP');

/**
 * OTP Service for Mauritanian phone numbers
 * Provider-agnostic - ready for SMS provider integration
 */

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Normalize Mauritanian phone number to +222 format
 */
const normalizePhone = (phone) => {
    // Remove spaces, dashes, dots
    let cleanPhone = phone.replace(/[\s\-\.]/g, '');

    // If it doesn't start with +222, prepend it
    if (!cleanPhone.startsWith('+222')) {
        // Remove leading 0 if present
        cleanPhone = cleanPhone.replace(/^0+/, '');
        cleanPhone = '+222' + cleanPhone;
    }

    return cleanPhone;
};

/**
 * Store OTP in database with expiration
 */
const storeOTP = async (phone, otp) => {
    const normalizedPhone = normalizePhone(phone);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Delete any existing unverified OTPs for this phone
    await OTP.deleteMany({ phone: normalizedPhone, verified: false });

    // Create new OTP
    const otpDoc = new OTP({
        phone: normalizedPhone,
        otp,
        expiresAt,
    });

    await otpDoc.save();
    return otpDoc;
};

/**
 * Send OTP via SMS (placeholder for future provider)
 * TODO: Integrate with SMS provider (Twilio, Vonage, or local Mauritanian provider)
 */
const sendOTP = async (phone, otp) => {
    const normalizedPhone = normalizePhone(phone);

    // PLACEHOLDER: Log OTP for development
    console.log(`[OTP Service] Would send OTP to ${normalizedPhone}: ${otp}`);
    console.log(`[OTP Service] Message: Votre code de vérification Khbarwelli est : ${otp}. Valide pendant ${OTP_EXPIRY_MINUTES} minutes.`);

    // TODO: When SMS provider is ready, replace with actual SMS sending
    // Example with Twilio:
    // await twilioClient.messages.create({
    //     body: `Votre code de vérification Khbarwelli est : ${otp}. Valide pendant ${OTP_EXPIRY_MINUTES} minutes.`,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: normalizedPhone
    // });

    return {
        success: true,
        message: 'OTP generated (SMS sending not configured)',
        phone: normalizedPhone,
    };
};

/**
 * Request OTP - Generate and send OTP
 */
const requestOTP = async (phone) => {
    try {
        const otp = generateOTP();
        await storeOTP(phone, otp);
        const result = await sendOTP(phone, otp);

        return {
            success: true,
            message: 'OTP sent successfully',
            ...result,
        };
    } catch (error) {
        console.error('[OTP Service] Error requesting OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP
 */
const verifyOTP = async (phone, otp) => {
    try {
        const normalizedPhone = normalizePhone(phone);

        // Find the most recent unverified OTP for this phone
        const otpDoc = await OTP.findOne({
            phone: normalizedPhone,
            verified: false,
            expiresAt: { $gt: new Date() }, // Not expired
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return {
                success: false,
                message: 'OTP not found or expired',
            };
        }

        // Check attempts
        if (otpDoc.attempts >= MAX_ATTEMPTS) {
            return {
                success: false,
                message: 'Maximum verification attempts exceeded',
            };
        }

        // Increment attempts
        otpDoc.attempts += 1;
        await otpDoc.save();

        // Verify OTP
        if (otpDoc.otp !== otp) {
            return {
                success: false,
                message: 'Invalid OTP',
                attemptsRemaining: MAX_ATTEMPTS - otpDoc.attempts,
            };
        }

        // Mark as verified
        otpDoc.verified = true;
        await otpDoc.save();

        return {
            success: true,
            message: 'OTP verified successfully',
            phone: normalizedPhone,
        };
    } catch (error) {
        console.error('[OTP Service] Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Check if phone has verified OTP (for registration/login flows)
 */
const hasVerifiedOTP = async (phone) => {
    const normalizedPhone = normalizePhone(phone);

    const verifiedOTP = await OTP.findOne({
        phone: normalizedPhone,
        verified: true,
        expiresAt: { $gt: new Date() },
    });

    return !!verifiedOTP;
};

module.exports = {
    generateOTP,
    normalizePhone,
    requestOTP,
    verifyOTP,
    hasVerifiedOTP,
    OTP_EXPIRY_MINUTES,
    MAX_ATTEMPTS,
};
