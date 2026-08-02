const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Notification = require('../models/Notification');
const { mockDb, helpers } = require('../utils/mockDb');
const { sendPaymentReceiptEmail } = require('../utils/sendEmail');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay Order (supports mock order if keys are missing)
// @route   POST /api/payments/order
// @access  Private (Member)
const createOrder = async (req, res) => {
  const { planId } = req.body;

  try {
    let plan;
    if (!global.dbConnected) {
      plan = helpers.findPlanById(planId);
    } else {
      plan = await MembershipPlan.findById(planId);
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    const amountInPaise = plan.price * 100;

    if (razorpay && global.dbConnected) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_plan_${planId}_${req.user.id}_${Date.now()}`
      };
      
      razorpay.orders.create(options, (err, order) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Razorpay order creation failed' });
        }
        res.json({ success: true, isMock: false, keyId: process.env.RAZORPAY_KEY_ID, order });
      });
    } else {
      // Mock order generation
      const mockOrderId = `order_mock_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!global.dbConnected) {
        mockDb.payments.push({
          _id: `pay_${Math.random().toString(36).substr(2, 9)}`,
          memberId: req.user.id,
          planId: plan._id,
          amount: plan.price,
          status: 'pending',
          paymentMethod: 'razorpay_mock',
          razorpayOrderId: mockOrderId,
          transactionDate: new Date()
        });
      } else {
        await Payment.create({
          memberId: req.user.id,
          planId: plan._id,
          amount: plan.price,
          status: 'pending',
          paymentMethod: 'razorpay_mock',
          razorpayOrderId: mockOrderId
        });
      }

      res.json({
        success: true,
        isMock: true,
        order: {
          id: mockOrderId,
          amount: amountInPaise,
          currency: 'INR'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Member)
const verifyPayment = async (req, res) => {
  const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  try {
    let plan;
    if (!global.dbConnected) {
      plan = helpers.findPlanById(planId);
    } else {
      plan = await MembershipPlan.findById(planId);
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    let isValid = false;

    if (!global.dbConnected) {
      const pendingPayment = mockDb.payments.find(p => 
        p.memberId === req.user.id &&
        p.planId === planId &&
        p.razorpayOrderId === razorpay_order_id &&
        p.status === 'pending'
      );

      if (pendingPayment) {
        pendingPayment.status = 'completed';
        pendingPayment.razorpayPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
        pendingPayment.transactionDate = new Date();
        isValid = true;

        // Update User Active Membership
        const user = helpers.findUserById(req.user.id);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        user.activeMembership = {
          planId: plan._id,
          status: 'active',
          startDate,
          endDate
        };

        // Notify
        mockDb.notifications.push({
          _id: `notif_${Math.random().toString(36).substr(2, 9)}`,
          userId: req.user.id,
          title: 'Membership Activated! 🏋️‍♂️',
          message: `Congratulations! Your '${plan.name}' plan is now active. Expiration date: ${endDate.toDateString()}`,
          type: 'membership',
          isRead: false,
          createdAt: new Date()
        });

        // Send receipt email
        sendPaymentReceiptEmail(user, pendingPayment, plan);

        return res.json({
          success: true,
          message: 'Payment completed successfully. Membership active!',
          data: user.activeMembership
        });
      }
    }

    // MongoDB Flow
    if (isMock) {
      const pendingPayment = await Payment.findOne({
        memberId: req.user.id,
        planId,
        razorpayOrderId: razorpay_order_id,
        status: 'pending'
      });

      if (pendingPayment) {
        pendingPayment.status = 'completed';
        pendingPayment.razorpayPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
        pendingPayment.transactionDate = new Date();
        await pendingPayment.save();
        isValid = true;
      }
    } else if (razorpay) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        await Payment.create({
          memberId: req.user.id,
          planId: plan._id,
          amount: plan.price,
          status: 'completed',
          paymentMethod: 'razorpay',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          transactionDate: new Date()
        });
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const user = await User.findById(req.user.id);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    user.activeMembership = {
      planId: plan._id,
      status: 'active',
      startDate,
      endDate
    };
    await user.save();

    await Notification.create({
      userId: req.user.id,
      title: 'Membership Activated! 🏋️‍♂️',
      message: `Congratulations! Your '${plan.name}' plan is now active. Expiration date: ${endDate.toDateString()}`,
      type: 'membership'
    });

    // Send receipt email
    const completedPayment = await Payment.findOne({ memberId: req.user.id, planId: plan._id, status: 'completed' }).sort({ transactionDate: -1 });
    sendPaymentReceiptEmail(user, completedPayment || { _id: 'N/A', amount: plan.price }, plan);

    res.json({
      success: true,
      message: 'Payment completed successfully. Membership active!',
      data: user.activeMembership
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download payment invoice as PDF
// @route   GET /api/payments/invoice/:id
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    let payment;
    
    if (!global.dbConnected) {
      payment = mockDb.payments.find(p => p._id === req.params.id);
      if (payment) {
        // Populate mock relations
        const member = helpers.findUserById(payment.memberId);
        const plan = helpers.findPlanById(payment.planId);
        payment = {
          ...payment,
          memberId: member,
          planId: plan
        };
      }
    } else {
      payment = await Payment.findById(req.params.id)
        .populate('memberId', 'name email phone address')
        .populate('planId', 'name price description');
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Auth validation
    const userId = payment.memberId._id || payment.memberId;
    if (req.user.role !== 'admin' && userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to invoice' });
    }

    // Create PDF Document
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${payment._id}.pdf`);

    doc.pipe(res);

    // Header styling
    doc.fillColor('#00FF00').fontSize(24).text('TITAN GYM CLUB', { align: 'center' });
    doc.fillColor('#FFFFFF').fontSize(10).text('123 Fitness Way, Tech City, IN', { align: 'center' });
    doc.text('Email: billing@titangym.com | Tel: +91 99776 65544', { align: 'center' });
    doc.moveDown();

    doc.moveTo(50, 110).lineTo(550, 110).stroke('#222222');
    doc.moveDown();

    // Invoice Info
    doc.fillColor('#AAAAAA').fontSize(10);
    doc.text(`Invoice ID: INV-${payment._id}`, 50, 130);
    doc.text(`Payment Date: ${new Date(payment.transactionDate).toDateString()}`, 50, 145);
    doc.text(`Status: ${payment.status.toUpperCase()}`, 50, 160);

    // Bill To Section
    doc.fillColor('#FFFFFF').fontSize(14).text('BILL TO:', 50, 190);
    doc.fillColor('#AAAAAA').fontSize(10);
    doc.text(`Name: ${payment.memberId.name}`, 50, 210);
    doc.text(`Email: ${payment.memberId.email}`, 50, 225);
    if (payment.memberId.phone) doc.text(`Phone: ${payment.memberId.phone}`, 50, 240);
    if (payment.memberId.address) doc.text(`Address: ${payment.memberId.address}`, 50, 255);

    // Table Header
    doc.moveTo(50, 290).lineTo(550, 290).stroke('#222222');
    doc.fillColor('#FFFFFF').fontSize(12).text('Description', 50, 300);
    doc.text('Qty', 350, 300, { width: 50, align: 'right' });
    doc.text('Price', 400, 300, { width: 150, align: 'right' });
    doc.moveTo(50, 320).lineTo(550, 320).stroke('#222222');

    // Table Content
    doc.fillColor('#AAAAAA').fontSize(10).text(`Gym Membership Plan: ${payment.planId.name}`, 50, 335);
    doc.text('1', 350, 335, { width: 50, align: 'right' });
    doc.text(`INR ${payment.amount}`, 400, 335, { width: 150, align: 'right' });

    // Summary
    doc.moveTo(50, 370).lineTo(550, 370).stroke('#222222');
    doc.fillColor('#FFFFFF').fontSize(12);
    doc.text('Subtotal:', 300, 385, { width: 100, align: 'right' });
    doc.text(`INR ${payment.amount}`, 400, 385, { width: 150, align: 'right' });

    doc.text('Tax (GST 0%):', 300, 405, { width: 100, align: 'right' });
    doc.text('INR 0.00', 400, 405, { width: 150, align: 'right' });

    doc.fillColor('#00FF00').fontSize(14).text('Total Paid:', 300, 430, { width: 100, align: 'right' });
    doc.text(`INR ${payment.amount}`, 400, 430, { width: 150, align: 'right' });

    doc.fillColor('#AAAAAA').fontSize(10).text('Thank you for training with Titan Gym Club!', 50, 500, { align: 'center' });
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  downloadInvoice
};
