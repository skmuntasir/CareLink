const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Demo sandbox helpers.
 *
 * The public demo accounts (User.isDemo === true) may only interact with other demo
 * accounts. A demo admin can therefore suspend/verify/edit the demo doctor, but any
 * attempt to touch a real user is rejected, and real users' data is never listed.
 */

const DEMO_FORBIDDEN = 'This is a demo account - it can only manage demo users.';

const isDemoUser = (user) => !!(user && user.isDemo);
const isDemoAdmin = (req) => !!(req.user && req.user.role === 'ADMIN' && req.user.isDemo);

// Ids of every demo account (used to scope admin lists / stats for the demo admin).
const getDemoUserIds = async () => User.find({ isDemo: true }).distinct('_id');

const deny = (res, message = DEMO_FORBIDDEN) =>
  res.status(403).json({ success: false, message });

// Block a route completely for the demo admin (profile edits, password changes, ...).
const blockForDemoAdmin = (message = 'Disabled in the demo account.') => (req, res, next) =>
  isDemoAdmin(req) ? deny(res, message) : next();

// Demo admin may only act on a demo user, given as a route param (e.g. :doctorUserId).
const demoTargetOnly = (param = 'doctorUserId') => async (req, res, next) => {
  try {
    if (!isDemoAdmin(req)) return next();
    const id = req.params[param];
    if (!mongoose.Types.ObjectId.isValid(id)) return deny(res);
    const target = await User.findById(id).select('isDemo');
    if (!target || !target.isDemo) return deny(res);
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Demo admin may only touch reports that involve a demo doctor.
const demoReportOnly = async (req, res, next) => {
  try {
    if (!isDemoAdmin(req)) return next();
    const Report = require('../models/Report');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return deny(res);
    const report = await Report.findById(req.params.id).select('doctorId');
    const doctor = report && (await User.findById(report.doctorId).select('isDemo'));
    if (!doctor || !doctor.isDemo) return deny(res);
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Demo admin may only refund payments of appointments between demo users.
const demoAppointmentOnly = async (req, res, next) => {
  try {
    if (!isDemoAdmin(req)) return next();
    const Appointment = require('../models/Appointment');
    const { appointmentId } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) return deny(res);
    const appt = await Appointment.findById(appointmentId).select('patientId doctorId');
    if (!appt) return deny(res);
    const demoCount = await User.countDocuments({
      _id: { $in: [appt.patientId, appt.doctorId] },
      isDemo: true,
    });
    if (demoCount !== 2) return deny(res);
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optional auth for public routes: sets req.user when a valid token is sent, never fails.
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (error) {
    // ignore invalid tokens on public routes
  }
  next();
};

module.exports = {
  DEMO_FORBIDDEN,
  isDemoUser,
  isDemoAdmin,
  getDemoUserIds,
  blockForDemoAdmin,
  demoTargetOnly,
  demoReportOnly,
  demoAppointmentOnly,
  optionalAuth,
};
