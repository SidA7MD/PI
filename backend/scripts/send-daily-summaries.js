const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dailySummaryService = require('./services/dailySummaryService');
const connectDB = require('./config/db');

dotenv.config();

/**
 * Manually trigger the daily summary notifications
 */
const run = async () => {
    try {
        await connectDB();
        console.log('🚀 Manual trigger: Sending daily summaries...');

        const count = await dailySummaryService.sendDailySummaries();

        console.log(`✅ Success! ${count} parents notified.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to send daily summaries:', err);
        process.exit(1);
    }
};

run();
