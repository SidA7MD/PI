const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');

/**
 * @route   POST /api/otp/request
 * @desc    Request OTP for phone number
 * @access  Public
 */
router.post('/request', async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required',
            });
        }
        
        // Validate Mauritanian phone format
        const cleanPhone = phone.replace(/[\s\-\.]/g, '');
        const isValid = /^\+?222[0-9]{8}$/.test(cleanPhone) || /^[0-9]{8}$/.test(cleanPhone);
        
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Mauritanian phone number format',
            });
        }
        
        const result = await otpService.requestOTP(phone);
        
        res.json(result);
    } catch (error) {
        console.error('[OTP Routes] Error requesting OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message,
        });
    }
});

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP for phone number
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        
        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required',
            });
        }
        
        const result = await otpService.verifyOTP(phone, otp);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('[OTP Routes] Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message,
        });
    }
});

module.exports = router;
