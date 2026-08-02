const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  resetUserPassword,
  getAdminPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAdminBookings,
  getAdminPayments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);

// Member overrides
router.route('/members')
  .get(getMembers);
router.route('/members/:id')
  .get(getMemberById)
  .put(updateMember)
  .delete(deleteMember);
router.put('/users/:id/password', resetUserPassword);

// Trainer CRUD
router.route('/trainers')
  .get(getTrainers)
  .post(createTrainer);
router.route('/trainers/:id')
  .put(updateTrainer)
  .delete(deleteTrainer);

// Plan CRUD
router.route('/plans')
  .get(getAdminPlans)
  .post(createPlan);
router.route('/plans/:id')
  .put(updatePlan)
  .delete(deletePlan);

// Bookings & Payments lists
router.get('/bookings', getAdminBookings);
router.get('/payments', getAdminPayments);

module.exports = router;
