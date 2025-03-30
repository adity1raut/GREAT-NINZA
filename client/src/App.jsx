import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute, AdminProtectedRoute } from "./Auth/ProtectRoute";

// Page Imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/ChatPage";
import Profile from "./pages/Profile";
import ForgotPass from "./pages/ForgetPass";
import AdminSignup from "./pages/AdminSigin";
import GlobalStyles from "./components/GlobalStyles";
import AdminProfile from "./pages/AdminProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDhas";
import ChatPage from "./ChatPage"

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyles />
        <Routes>
         
          <Route path="/" element={<Home />} />
          
          <Route path="/c" element={<ChatPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-pass" element={<ForgotPass />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
          </Route>
          
         
          <Route element={<ProtectedRoute allowedTypes={['user']} />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;