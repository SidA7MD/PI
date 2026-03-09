const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for cleanup...');

        // Find users with phone: null and update to undefined (remove the field)
        const resultPhone = await User.updateMany(
            { phone: null },
            { $unset: { phone: "" } }
        );
        console.log(`Updated ${resultPhone.modifiedCount} users with phone: null`);

        // Find users with username: null and update to undefined
        const resultUsername = await User.updateMany(
            { username: null },
            { $unset: { username: "" } }
        );
        console.log(`Updated ${resultUsername.modifiedCount} users with username: null`);

        console.log('Cleanup finished.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup error:', error);
        process.exit(1);
    }
}

cleanup();
