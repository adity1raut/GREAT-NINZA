import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, MessageSquare, User, LogOut, LogIn, UserPlus, Lock, Shield } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    logout, 
    adminLogout, 
    isAuthenticated, 
    loading, 
    userType, 
    isAdmin, 
    isUser 
  } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      // Use appropriate logout method based on user type
      if (isAdmin) {
        await adminLogout();
      } else {
        await logout();
      }
      
      toast.success("Successfully logged out!");
      navigate("/");
      if (isMobile) setIsOpen(false);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
    }
  };

  const handleNavigation = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <ToastContainer />

      {/* Mobile Header with Toggle Button */}
      <div className="fixed top-0 left-0 w-full p-4 flex items-center z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 mr-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-white text-xl font-bold">PRAVESH</span>
      </div>
      
      {/* Empty space to prevent content from hiding behind fixed header on mobile */}
      <div className="h-16 lg:hidden"></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg transform transition-transform duration-200 ease-in-out z-50 
                  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                  lg:translate-x-0 lg:static lg:w-64 h-screen 
                  ${isMobile ? "pt-16" : ""}`}
      >
        <div className="p-6 border-b border-gray-800 hidden lg:block">
          <Link to="/" className="text-white text-2xl font-bold">
           PRAVESH
          </Link>
        </div>

        {/* Show loading indicator while auth state is being determined */}
        {loading ? (
          <div className="flex justify-center items-center p-8 text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            {/* Navigation Links */}
            <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100% - 160px)" }}>
              {/* Home is visible to all users */}
              <Link
                to="/"
                className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/") ? "bg-gray-800 text-white" : ""}`}
                onClick={handleNavigation}
              >
                <Home size={18} className="mr-2" />
                Home
              </Link>

              {/* Authentication-required links */}
              {isAuthenticated ? (
                <>
                  {/* User links */}
                  {isUser && (
                    <>
                      <Link
                        to="/chat"
                        className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/chat") ? "bg-gray-800 text-white" : ""}`}
                        onClick={handleNavigation}
                      >
                        <MessageSquare size={18} className="mr-2" />
                        Chat
                      </Link>
                      <Link
                        to="/profile"
                        className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/profile") ? "bg-gray-800 text-white" : ""}`}
                        onClick={handleNavigation}
                      >
                        <User size={18} className="mr-2" />
                        Profile
                      </Link>
                    </>
                  )}

                  {/* Admin links */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/admin") ? "bg-gray-800 text-white" : ""}`}
                      onClick={handleNavigation}
                    >
                      <Shield size={18} className="mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {/* Authentication links (only shown when not authenticated) */}
                  <Link
                    to="/login"
                    className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/login") ? "bg-gray-800 text-white" : ""}`}
                    onClick={handleNavigation}
                  >
                    <LogIn size={18} className="mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/signup") ? "bg-gray-800 text-white" : ""}`}
                    onClick={handleNavigation}
                  >
                    <UserPlus size={18} className="mr-2" />
                    Sign Up
                  </Link>
                  <Link
                    to="/forgot-pass"
                    className={`flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 ${isActive("/forgot-pass") ? "bg-gray-800 text-white" : ""}`}
                    onClick={handleNavigation}
                  >
                    <Lock size={18} className="mr-2" />
                    Forgot Password
                  </Link>
                </>
              )}
            </div>

            {/* Bottom Section (Logout button only when authenticated) */}
            {isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
                <button
                  className="w-full flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Log Out
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Overlay (for mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;