import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import transporter from "../../config/NodeMailer.js";
import Admin from "../../models/Admin.model.js"
dotenv.config();

const router = express.Router();
const otpStore = new Map();
const otpAttempts = new Map();
const verifiedUsers = new Map(); 

router.post('/api/admin/send-otp', async (req, res) => {
    try {
        const { email, name, phoneNumber, naacNumber, collegeCode, city, state, password, collegeName } = req.body;

        // Check for required fields
        if (!email || !name || !collegeCode || !city || !naacNumber || !phoneNumber || !state || !password || !collegeName) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Please enter a valid 10-digit phone number." });
        }

        // NAAC number validation
        const naacRegex = /^[A-Za-z0-9]+$/;
        if (!naacRegex.test(naacNumber)) {
            return res.status(400).json({ message: "Please enter a valid alphanumeric NAAC number." });
        }

        // College code validation
        const codeRegex = /^[A-Za-z0-9]+$/;
        if (!codeRegex.test(collegeCode)) {
            return res.status(400).json({ message: "Please enter a valid alphanumeric college code." });
        }

        // Password validation
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include both letters and numbers." });
        }

        // Check if user already exists in the database
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "User already exists." });
        }

        // OTP rate limiting logic
        const now = Date.now();
        const userAttempts = otpAttempts.get(email) || [];
        const recentAttempts = userAttempts.filter(time => now - time < 15 * 60 * 1000);

        if (recentAttempts.length >= 3) {
            return res.status(429).json({
                message: "Too many OTP requests. Please try again after 15 minutes."
            });
        }

        // Generate OTP (4 digits)
        const otp = crypto.randomInt(1000, 9999).toString();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
            userData: {
                name,
                phoneNumber,
                naacNumber,
                collegeCode,
                city,
                state,
                password,
                collegeName
            }
        });

        otpAttempts.set(email, [...recentAttempts, now]);

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'your-email@gmail.com',
            to: email,
            subject: "Your OTP Code for Pravesh AI Portal - Admin Access",
            text: `Hello ${name},
        
        Your OTP verification code is ${otp}. It is valid for 5 minutes.
        
        Please enter this code in the verification page to complete your admin access setup.
        
        If you didn't request this OTP, please ignore this email.
        
        Regards,
        Pravesh Portal Team`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4f46e5;">Pravesh AI Portal</h2>
                    <p style="color: #4f46e5; font-size: 18px;">Admin Access OTP</p>
                </div>
                <p>Hello ${name},</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #333;">Your OTP verification code is:</p>
                    <h2 style="margin: 10px 0; color: #4f46e5; letter-spacing: 5px;">${otp}</h2>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">Valid for 5 minutes</p>
                </div>
                <p>Please enter this code in the verification page to complete your admin access setup.</p>
                <p>If you didn't request this OTP, please ignore this email.</p>
                <p style="margin-top: 30px; font-size: 14px; color: #333;">Regards,<br>Pravesh Portal Team</p>
            </div>
            `
        });
        

        console.log(`OTP sent to ${email}: ${otp}`);

        res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Error sending OTP." });
    }
});

// Route to verify OTP and store data in the database
router.post('/api/admin/verify-otp', async (req, res) => {
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

        // Store user data in the database
        const userData = storedOtpData.userData;

        // Hash password for security
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(userData.password, salt);

        // Create a new Admin document
        const newAdmin = new Admin({
            name: userData.name,
            email: email,
            password: hashedPassword,
            role: "Admin",
            collegeName: userData.collegeName,
            collegeCode: userData.collegeCode,
            collegeCity: userData.city,
            collegeState: userData.state,
            phoneNumber: userData.phoneNumber,
            naacNumber: userData.naacNumber,
            isVerified: true,
            registeredAt: Date.now(),
        });

        // Save the document to the database
        await newAdmin.save();

        // Clean up OTP store
        otpStore.delete(email);

        res.status(200).json({ 
            success: true, 
            message: "OTP verified successfully. Account created.",
            user: {
                email,
                name: userData.name,
                role: "admin"
            }
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Error verifying OTP" });
    }
});

export default router;