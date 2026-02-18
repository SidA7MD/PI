const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/absence_management');
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        try {
            console.log('Dropping phone_1 index...');
            await users.dropIndex('phone_1');
            console.log('phone_1 dropped');
        } catch (e) {
            console.log('phone_1 not found or error dropping:', e.message);
        }

        try {
            console.log('Dropping username_1 index...');
            await users.dropIndex('username_1');
            console.log('username_1 dropped');
        } catch (e) {
            console.log('username_1 not found or error dropping:', e.message);
        }

        console.log('Indexes dropped. They will be recreated by Mongoose on next start/save.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
