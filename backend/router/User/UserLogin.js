import express from "express";
import User from "../../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateUser } from "../../middleware/AuthToken.js";

dotenv.config();

const router = express.Router();

// User login endpoint
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userType: user.type
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Set cookie with the token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });

    // Return user info (excluding password)
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        college_name: user.college_name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
});

// Logout endpoint to clear the cookie
router.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.status(200).json({ message: "Logged out successfully" });
});

// Get current user info from token (protected route)
router.get('/api/me', authenticateUser, async (req, res) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;