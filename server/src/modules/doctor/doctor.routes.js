const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../../middlewares/auth');
const { checkDoctorRestrictions } = require('../../middlewares/doctorRestrictions');
const { validate } = require('../../middlewares/validate');
const { demoTargetOnly, optionalAuth } = require('../../middlewares/demoGuard');
const {
  createOrUpdateProfile,
  getMyProfile,
  getVerifiedDoctors,
  getDoctorById,
  getPendingDoctors,
  verifyDoctor,
  requestReverification,
} = require('./doctor.controller');
const {
  createProfileSchema,
  verifyDoctorSchema,
  requestReverificationSchema,
} = require('./doctor.validation');

// Public routes
router.get('/doctors', optionalAuth, getVerifiedDoctors);
router.get('/doctors/:id', optionalAuth, getDoctorById);

// Doctor routes
router.post('/doctor/me/profile', requireAuth, requireRole('DOCTOR'), checkDoctorRestrictions, validate(createProfileSchema), createOrUpdateProfile);
router.get('/doctor/me/profile', requireAuth, requireRole('DOCTOR'), getMyProfile);
router.post('/doctor/me/request-reverification', requireAuth, requireRole('DOCTOR'), validate(requestReverificationSchema), requestReverification);

// Admin routes
router.get('/admin/doctors/pending', requireAuth, requireRole('ADMIN'), getPendingDoctors);
router.patch('/admin/doctors/:doctorUserId/verify', requireAuth, requireRole('ADMIN'), demoTargetOnly('doctorUserId'), validate(verifyDoctorSchema), verifyDoctor);

module.exports = router;
