import express from 'express';
import  cors from "cors"
import ConnectDb from "./db/ConnectDb.js"
import dotenv from "dotenv"
import UserRoute from "./router/User/UserSignin.js"
import LoginRoute from "./router/User/UserLogin.js"
import UserProfile from "./router/User/UserProfile.js"
import ForgetPass from "./router/ForgetPass/ForgetPass.js"
import AdminSignUp from "./router/Admin/AdminSignin.js"
import AdminLogin from "./router/Admin/Adminlogin.js"
import AdminProfile from "./router/Admin/AdminProfile.js"
import SearchHistry from "./router/User/UserSearch.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());

ConnectDb();

app.use(UserRoute);
app.use(LoginRoute);
app.use(UserProfile);
app.use(ForgetPass);
app.use(AdminSignUp);
app.use(AdminLogin)
app.use(AdminProfile)
app.use(SearchHistry);



const PORT = process.env.PORT || 3000 ;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});