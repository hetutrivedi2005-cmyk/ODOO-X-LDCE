const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, requireAdmin } = require('../middleware/auth.middleware');

// Protect all admin routes with authentication AND admin role authorization
router.use(protect);
router.use(requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.get('/trips', adminController.getTrips);
router.get('/activity', adminController.getActivityLogs);
router.get('/reports', adminController.getAdminReports);

module.exports = router;
