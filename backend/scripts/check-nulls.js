const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb://localhost:27017/absence_management');
        const db = mongoose.connection.db;
        const users = db.collection('users');
        const count = await users.countDocuments({ phone: { $type: 10 } });
        console.log('Actual BSON nulls:', count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
