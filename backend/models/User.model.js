import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Student', 'Admin'], 
        default: 'Student', 
    },
    college_name: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

export default User;
