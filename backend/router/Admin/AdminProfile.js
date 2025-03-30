import express from "express";
import mongoose from "mongoose";
import Admin from "../../models/Admin.model.js";

const router = express.Router();

router.get('/api/admin/profile', async (req, res) => {
   try {
     const userId = req.query.userId || (req.user ? req.user._id : null);
     
     if (!userId) {
       return res.status(401).json({ message: "User ID is required" });
     }
     
     if (!mongoose.Types.ObjectId.isValid(userId)) {
       return res.status(400).json({ message: "Invalid user ID format" });
     }
     
     const admin = await Admin.findById(userId).select('-password');
     
     if (!admin) {
       return res.status(404).json({ message: "Admin profile not found" });
     }
     
     const profileData = {
       name: admin.name,
       email: admin.email,
       role: admin.role,
       collegeName: admin.collegeName,
       collegeCode: admin.collegeCode,
       collegeCity: admin.collegeCity,
       collegeState: admin.collegeState,
       phoneNumber: admin.phoneNumber,
       naacNumber: admin.naacNumber,
       isVerified: admin.isVerified,
       registeredAt: admin.registeredAt,
       
       // Additional metadata from timestamps
       createdAt: admin.createdAt,
       updatedAt: admin.updatedAt
     };
     
     res.status(200).json(profileData);
   } catch (error) {
     console.error("Error fetching admin profile:", error);
     res.status(500).json({ 
       message: "Error fetching admin profile data", 
       error: error.message 
     });
   }
});

export default router;