/**
 * Seed script to create initial superadmin account
 * Run with: node scripts/seedSuperAdmin.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const connectDB = require('../config/db');

const SUPERADMIN_DATA = {
  username: process.env.SUPERADMIN_USERNAME || 'superadmin',
  email: process.env.SUPERADMIN_EMAIL || 'admin@system.local',
  phone: process.env.SUPERADMIN_PHONE || '0000000000',
  password: process.env.SUPERADMIN_PASSWORD || 'Admin123!',
  role: 'superadmin',
};

const seedSuperAdmin = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to database');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Superadmin already exists:');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('   No changes made.');
      process.exit(0);
    }

    // Check for duplicate username/email/phone
    const duplicateCheck = await User.findOne({
      $or: [
        { username: SUPERADMIN_DATA.username },
        { email: SUPERADMIN_DATA.email },
        { phone: SUPERADMIN_DATA.phone },
      ]
    });

    if (duplicateCheck) {
      console.error('❌ Cannot create superadmin: username, email, or phone already exists');
      process.exit(1);
    }

    // Create superadmin
    const superadmin = await User.create(SUPERADMIN_DATA);

    console.log('✅ Superadmin created successfully!');
    console.log('   ─────────────────────────────────');
    console.log(`   Username: ${superadmin.username}`);
    console.log(`   Email: ${superadmin.email}`);
    console.log(`   Phone: ${superadmin.phone}`);
    console.log(`   Password: ${SUPERADMIN_DATA.password}`);
    console.log('   ─────────────────────────────────');
    console.log('   ⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
