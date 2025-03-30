import express from "express";
import mongoose from "mongoose";
import User from "../../models/User.model.js";
import SearchHistory from "../../models/SearchHistory.model.js";

const router = express.Router();

router.get('/api/profile', async (req, res) => {
  try {
    const userId = req.query.userId || (req.user ? req.user._id : null);
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const searchHistory = await SearchHistory.find({ userId: new mongoose.Types.ObjectId(userId) }) // Use `new` here
      .sort({ timestamp: -1 }) 
      .limit(10); 

    const profileData = {
      name: user.name,
      email: user.email,
      photo: user.profilePhoto || "https://via.placeholder.com/150",
      memberSince: user.createdAt,
      lastActive: user.lastLogin,
      searchHistory: searchHistory.map(history => ({
        id: history._id,
        query: history.query,
        timestamp: history.timestamp,
        category: history.category
      }))
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile data", error: error.message });
  }
});

export default router;