const nodemailer = require('nodemailer');

/**
 * Utility to send HTML emails using Nodemailer
 * Supports SMTP (Gmail / SendGrid / Mailtrap) or automatic Ethereal test inbox fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    let transporter;

    // Check if custom SMTP options are provided in .env
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Fallback: Generate an automatic Ethereal test account for dev preview
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Titan Fitness Center" <${process.env.EMAIL_USER || 'no-reply@titangym.com'}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`\n========================================`);
    console.log(`📧 EMAIL DELIVERED TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`MESSAGE ID: ${info.messageId}`);

    // If Ethereal test message, log preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 VIEW EMAIL PREVIEW (Ethereal Inbox): ${previewUrl}`);
    }
    console.log(`========================================\n`);

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    // Don't crash request if email sending fails
    return { success: false, error: error.message };
  }
};

/**
 * Template 1: Welcome Email on Registration
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 900; color: #ccff00; letter-spacing: 2px; text-transform: uppercase; }
        .title { color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 10px; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .highlight-box { background: rgba(204, 255, 0, 0.08); border: 1px solid rgba(204, 255, 0, 0.3); border-radius: 12px; padding: 16px; margin: 20px 0; }
        .btn { display: inline-block; background-color: #ccff00; color: #000000; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-top: 20px; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ TITAN FITNESS CENTER</div>
          <div class="title">Welcome to the Squad, ${user.name}!</div>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Thank you for joining Titan Gym! Your account is officially active, giving you access to customized workout plans, trainer bookings, weight progress metrics, and QR check-ins.</p>

          <div class="highlight-box">
            <p style="margin: 0; font-weight: bold; color: #ffffff;">Account Overview:</p>
            <p style="margin: 4px 0 0 0; color: #ccff00;">Registered Email: ${user.email}</p>
            <p style="margin: 4px 0 0 0; color: #94a3b8;">Account Role: ${user.role.toUpperCase()}</p>
          </div>

          <p>Log in to your member portal anytime to select your membership plan or view assigned trainer workouts.</p>

          <div style="text-align: center;">
            <a href="http://localhost:3000/login" class="btn">GO TO MEMBER DASHBOARD</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Titan Fitness Center. All rights reserved.</p>
          <p>If you did not sign up for this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `⚡ Welcome to Titan Fitness Center, ${user.name}!`,
    html,
  });
};

/**
 * Template 2: Password Reset PIN Email
 */
const sendPasswordResetEmail = async (email, pin) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 900; color: #ccff00; letter-spacing: 2px; text-transform: uppercase; }
        .title { color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 10px; }
        .pin-box { background: #0f172a; border: 2px dashed #ccff00; border-radius: 12px; text-align: center; padding: 20px; margin: 24px 0; }
        .pin { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #ccff00; font-family: monospace; }
        .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ TITAN FITNESS CENTER</div>
          <div class="title">Password Reset Verification</div>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a password reset for your Titan Gym account linked to <strong>${email}</strong>. Use the 6-digit verification code below to reset your password:</p>

          <div class="pin-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 6px;">Verification PIN</div>
            <div class="pin">${pin}</div>
          </div>

          <p style="font-size: 13px; color: #ef4444;"><strong>Security Note:</strong> This PIN will expire shortly. Do not share this code with anyone.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Titan Fitness Center. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `🔑 ${pin} is your Titan Gym Password Reset PIN`,
    html,
  });
};

/**
 * Template 3: Payment Receipt Email
 */
const sendPaymentReceiptEmail = async (user, payment, plan) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 900; color: #ccff00; letter-spacing: 2px; text-transform: uppercase; }
        .title { color: #22c55e; font-size: 20px; font-weight: 800; margin-top: 10px; }
        .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .receipt-table th, .receipt-table td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; font-size: 14px; }
        .receipt-table th { color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 12px; }
        .receipt-table td { color: #ffffff; }
        .total { font-size: 18px; font-weight: 900; color: #ccff00; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ TITAN FITNESS CENTER</div>
          <div class="title">✔ Payment Confirmed!</div>
        </div>
        <div class="content">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your membership payment has been processed successfully. Below is your official receipt details:</p>

          <table class="receipt-table">
            <tr>
              <th>Description</th>
              <th>Details</th>
            </tr>
            <tr>
              <td>Plan Purchased</td>
              <td><strong>${plan.name}</strong> (${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''})</td>
            </tr>
            <tr>
              <td>Transaction ID</td>
              <td><code>${payment.razorpayPaymentId || payment._id}</code></td>
            </tr>
            <tr>
              <td>Date</td>
              <td>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td>Amount Paid</td>
              <td class="total">₹${payment.amount}</td>
            </tr>
          </table>

          <p>Your membership status is now <span style="color: #22c55e; font-weight: bold;">ACTIVE</span>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Titan Fitness Center. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `💳 Payment Receipt - Titan Gym ${plan.name}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentReceiptEmail,
};
