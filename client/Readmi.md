import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 
import { ProtectedRoute, PublicOnlyRoute } from "./Auth/ProtectRoute";

// Import your pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/ChatPage";
import Profile from "./pages/Profile";
import ForgotPass from "./pages/ForgetPass";
import AdminSignup from "./pages/AdminSigin";
import GlobalStyles from "./components/GlobalStyles";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyles />
        <Routes>

          <Route path="/" element={<Home />} />
          
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-pass" element={<ForgotPass />} />
            <Route path="/admin" element={<AdminSignup />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Fallback route for non-existent paths */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;