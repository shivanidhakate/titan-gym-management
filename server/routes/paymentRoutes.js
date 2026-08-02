const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, downloadInvoice } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/order', protect, authorize('member'), createOrder);
router.post('/verify', protect, authorize('member'), verifyPayment);
router.get('/invoice/:id', protect, downloadInvoice);

module.exports = router;
