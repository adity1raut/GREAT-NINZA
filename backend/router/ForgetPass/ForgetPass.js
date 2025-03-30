
import express from 'express';
import User from "../../models/User.model.js"; 
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import transporter from '../../config/nodemailer.js';

const router = express.Router();

const otpStore = new Map();

router.post('/api/v1/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. 
             This OTP is valid for 10 minutes.`
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/api/v1/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedOtp = otpStore.get(email);

    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    otpStore.delete(email);

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Step 3: Reset Password Route
router.post('/api/v1/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
