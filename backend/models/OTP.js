const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
    },
    verified: {
        type: Boolean,
        default: false,
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

// Index for faster lookups
otpSchema.index({ phone: 1, verified: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
