import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { Mail, Lock, Check, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPass = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [forgotPassError, setForgotPassError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (forgotPassError) setForgotPassError("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotPassError("");

    if (!validateEmail(formData.email)) {
      setErrors({ email: "Please enter a valid email" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/forgot-password', { email: formData.email });
      
      toast.success(response.data.message);
      setStep(2);
    } catch (error) {
      setForgotPassError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotPassError("");

    if (!formData.otp || formData.otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/verify-otp', { 
        email: formData.email, 
        otp: formData.otp 
      });
      
      toast.success(response.data.message);
      setStep(3);
    } catch (error) {
      setForgotPassError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setForgotPassError("");

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setErrors({ newPassword: "Password must be at least 6 characters" });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/reset-password', { 
        email: formData.email, 
        newPassword: formData.newPassword 
      });
      
      toast.success(response.data.message);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setForgotPassError(error.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="sticky top-0 h-screen bg-black">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className={`flex-1 transition-margin duration-200 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"} flex flex-col`}>
        <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold">Password Recovery</h2>
        </div>

        {/* Forgot Password Form Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
              </h1>
              <p className="text-center text-gray-400 mb-8">
                {step === 1 
                  ? "Enter your email to reset your password" 
                  : step === 2 
                  ? "Enter the OTP sent to your email" 
                  : "Create a new password"}
              </p>

              {forgotPassError && (
                <div className="mb-6 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200">
                  {forgotPassError}
                </div>
              )}

              <form className="space-y-6" onSubmit={
                step === 1 ? handleEmailSubmit : 
                step === 2 ? handleOtpSubmit : 
                handlePasswordSubmit
              }>
                <div className="space-y-5">
                  {step === 1 && (
                    <FormInput
                      id="email"
                      name="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="youremail@example.com"
                      error={errors.email}
                      icon={Mail}
                      autoComplete="email"
                    />
                  )}

                  {step === 2 && (
                    <FormInput
                      id="otp"
                      name="OTP"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      error={errors.otp}
                      icon={Check}
                      maxLength={6}
                    />
                  )}

                  {step === 3 && (
                    <>
                      <FormInput
                        id="newPassword"
                        name="New Password"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        error={errors.newPassword}
                        icon={Lock}
                      />
                      <FormInput
                        id="confirmPassword"
                        name="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        error={errors.confirmPassword}
                        icon={Lock}
                      />
                    </>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${
                      isLoading ? "bg-indigo-800" : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]`}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        <span className="flex items-center">
                          <ArrowRight size={18} className="mr-2" />
                          {step === 1 ? "Send OTP" : step === 2 ? "Verify OTP" : "Reset Password"}
                        </span>
                        <span className="absolute right-3 inset-y-0 flex items-center">
                          <ArrowRight
                            size={16}
                            className="ml-1 group-hover:translate-x-1 transition-transform duration-200"
                          />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="text-center">
              <p className="text-gray-400">
                Remember your password?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black text-center text-gray-500">
          <p>© 2025 PRAVESH - Empowering students through AI</p>
        </div>

        {/* Toast Container */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="dark"
        />
      </div>
    </div>
  );
};

export default ForgotPass;