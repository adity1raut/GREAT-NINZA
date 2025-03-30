import express from "express";
import User from "../../models/User.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import transporter from "../../config/NodeMailer.js";

dotenv.config();

const router = express.Router();
const otpStore = new Map();
const otpAttempts = new Map();

// Send OTP endpoint
router.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const now = Date.now();
    const userAttempts = otpAttempts.get(email) || [];
    const recentAttempts = userAttempts.filter(time => now - time < 15 * 60 * 1000);
    
    if (recentAttempts.length >= 3) {
      return res.status(429).json({ 
        message: "Too many OTP requests. Please try again later." 
      });
    }
    
    // Generate OTP (4 digits)
    const otp = crypto.randomInt(1000, 9999).toString();
    // Store OTP with 5-minute expiration
    otpStore.set(email, { 
      otp, 
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0 // Track failed verification attempts
    });
    
    // Update rate limiting tracker
    otpAttempts.set(email, [...recentAttempts, now]);
    
    // Send email with OTP
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'your-email@gmail.com',
      to: email,
      subject: "Your OTP Code for Pravesh AI SignUp",
      text: `Hello ${name},
  
  Your OTP verification code is ${otp}. It is valid for 5 minutes.
  
  Please enter this code in the verification page to complete your registration.
  
  If you didn't request this OTP, please ignore this email.
  
  Regards,
  Pravesh Portal Team`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #4f46e5;">Pravesh AI Portal</h2>
              <p style="color: #4f46e5; font-size: 18px;">User Access OTP</p>
          </div>
          <p>Hello ${name},</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #333;">Your OTP verification code is:</p>
              <h2 style="margin: 10px 0; color: #4f46e5; letter-spacing: 5px;">${otp}</h2>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Valid for 5 minutes</p>
          </div>
          <p>Please enter this code in the verification page to complete your registration.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #333;">Regards,<br>Pravesh Portal Team</p>
      </div>
      `
  });
  
    
    console.log(`OTP sent to ${email}: ${otp}`);
    
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// Verify OTP endpoint
router.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }
    
    // Check if OTP is expired
    if (storedOtpData.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }
    
    // Check for too many failed attempts (max 5)
    if (storedOtpData.attempts >= 5) {
      otpStore.delete(email);
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }
    
    // Verify OTP
    if (storedOtpData.otp !== otp) {
      // Increment failed attempts
      storedOtpData.attempts += 1;
      otpStore.set(email, storedOtpData);
      
      return res.status(400).json({ 
        message: "Invalid OTP", 
        attemptsLeft: 5 - storedOtpData.attempts 
      });
    }
    
    // OTP verified, clean up
    otpStore.delete(email);
    
    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

// Create user endpoint
router.post('/api/users', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }
    
    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name: name,
      email: email,
      type: "Student", // Default type
      password: hashedPassword,
    });
    
    await newUser.save();
    
    console.log("User saved:", newUser);
    res.status(201).json({ 
      message: "User registered successfully", 
      name: name,
      userId: newUser._id
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

export default router;