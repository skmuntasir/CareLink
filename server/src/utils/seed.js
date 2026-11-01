const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const AvailabilitySlot = require('../models/AvailabilitySlot');

/**
 * Accounts created automatically on server start (any NODE_ENV).
 * Existing users are NEVER overwritten, so the seed is safe to run repeatedly.
 */

// Real administrator. Can be overridden with ADMIN_EMAIL / ADMIN_PASSWORD env vars.
const REAL_ADMIN = {
  name: 'Rian',
  email: (process.env.ADMIN_EMAIL || 'rian@gmail.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'Rian@123',
  role: 'ADMIN',
};

// Old default admin from earlier versions - migrated to REAL_ADMIN if it still exists.
const LEGACY_ADMIN_EMAIL = 'admin@bracu.ac.bd';

// Public demo accounts (shown on the login page under "Demo").
const DEMO_USERS = [
  { name: 'Demo Admin', email: 'admin@gmail.com', password: 'Admin@123', role: 'ADMIN', isDemo: true },
  { name: 'Demo Patient', email: 'patient@gmail.com', password: 'Patient@123', role: 'PATIENT', isDemo: true },
  { name: 'Dr. Demo Doctor', email: 'doctor@gmail.com', password: 'Doctor@123', role: 'DOCTOR', isDemo: true },
];

const ensureUser = async (def) => {
  const existing = await User.findOne({ email: def.email });
  if (existing) {
    // Make sure demo accounts created by an earlier version carry the sandbox flag
    if (def.isDemo && !existing.isDemo) {
      existing.isDemo = true;
      await existing.save();
    }
    return existing;
  }

  // Plain-text password - hashed by the User pre-save hook.
  const user = new User({
    name: def.name,
    email: def.email,
    password: def.password,
    role: def.role,
    isEmailVerified: true,
    isActive: true,
    isDemo: !!def.isDemo,
  });
  await user.save();
  console.log(`✅ Created ${def.role} account: ${def.email}`);
  return user;
};

const ensureRealAdmin = async () => {
  const existing = await User.findOne({ email: REAL_ADMIN.email });
  if (existing) return;

  // Rename the old default admin instead of leaving two admins behind.
  const legacy = await User.findOne({ email: LEGACY_ADMIN_EMAIL });
  if (legacy) {
    legacy.name = REAL_ADMIN.name;
    legacy.email = REAL_ADMIN.email;
    legacy.password = REAL_ADMIN.password; // re-hashed by pre-save hook
    legacy.role = 'ADMIN';
    legacy.isActive = true;
    await legacy.save();
    console.log(`✅ Migrated ${LEGACY_ADMIN_EMAIL} -> ${REAL_ADMIN.email}`);
    return;
  }

  await ensureUser(REAL_ADMIN);
};

const ensureDemoDoctorProfile = async (doctorUser) => {
  const hasProfile = await DoctorProfile.findOne({ userId: doctorUser._id });
  if (hasProfile) {
    // Self-heal: visitors can suspend/reject the demo doctor, so every server start restores it
    let changed = false;
    if (hasProfile.verificationStatus !== 'VERIFIED') {
      hasProfile.verificationStatus = 'VERIFIED';
      hasProfile.rejectionReason = '';
      changed = true;
    }
    if (changed) await hasProfile.save();
    if (doctorUser.suspendedAt || !doctorUser.isActive || doctorUser.deletedAt) {
      doctorUser.suspendedAt = null;
      doctorUser.deletedAt = null;
      doctorUser.isActive = true;
      await doctorUser.save();
    }
  } else {
    await DoctorProfile.create({
      userId: doctorUser._id,
      specialization: 'General Physician',
      experienceYears: 8,
      fee: 500,
      bio: 'Demo doctor account for exploring CareLink. Experienced general physician available for online consultations.',
      licenseNo: 'DEMO-0001',
      verificationStatus: 'VERIFIED',
    });
    console.log('✅ Created verified profile for demo doctor');
  }

  // Give the demo doctor bookable slots for the next 5 days (only if they have none).
  const hasSlots = await AvailabilitySlot.exists({ doctorId: doctorUser._id });
  if (!hasSlots) {
    const times = [
      ['10:00', '10:30'],
      ['11:00', '11:30'],
      ['15:00', '15:30'],
    ];
    const slots = [];
    for (let d = 1; d <= 5; d++) {
      const date = new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      for (const [startTime, endTime] of times) {
        slots.push({ doctorId: doctorUser._id, date, startTime, endTime });
      }
    }
    await AvailabilitySlot.insertMany(slots);
    console.log('✅ Created availability slots for demo doctor');
  }
};

const ensureAdminExists = async () => {
  try {
    await ensureRealAdmin();

    for (const def of DEMO_USERS) {
      const user = await ensureUser(def);
      if (def.role === 'DOCTOR') await ensureDemoDoctorProfile(user);
    }
  } catch (error) {
    console.error('❌ Error seeding accounts:', error.message);
  }
};

module.exports = { ensureAdminExists };

// `npm run seed` -> run this file directly
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(ensureAdminExists)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
