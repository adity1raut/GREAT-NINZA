import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Access denied. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
};