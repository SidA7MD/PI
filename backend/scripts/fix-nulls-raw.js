const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const users = db.collection('users');

        const r1 = await users.updateMany({ phone: null }, { $unset: { phone: 1 } });
        console.log('Fixed phone (null):', r1.modifiedCount);

        const r2 = await users.updateMany({ username: null }, { $unset: { username: 1 } });
        console.log('Fixed username (null):', r2.modifiedCount);

        const r3 = await users.updateMany({ phone: "" }, { $unset: { phone: 1 } });
        console.log('Fixed phone (empty string):', r3.modifiedCount);

        const r4 = await users.updateMany({ username: "" }, { $unset: { username: 1 } });
        console.log('Fixed username (empty string):', r4.modifiedCount);

        console.log('Done');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
