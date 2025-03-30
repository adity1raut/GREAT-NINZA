
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
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
    role : {
        type: String,
        enum: ['Student', 'Admin'], 
        default: 'Admin', 
    },
    collegeName :{
        type: String,
        required: true,
    },
    collegeCode : {
        type: String,
        required: true,
    },
    collegeCity : {
        type: String,
        required: true,
    },
    collegeState : {
        type: String,
        required: true,
    },
    phoneNumber : {
        type: String,
        required: true,
    },
    naacNumber : {
        type: String,
        required: true,
    },
    isVerified : {
        type: Boolean,
        default: false,
    },
    registeredAt : {
        type: Date,
        default: Date.now,
    },  

} , {timestamps: true});


const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;