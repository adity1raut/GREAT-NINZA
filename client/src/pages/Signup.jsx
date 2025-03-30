import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, LogIn, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import SignupStep1 from "../components/signup/SignupStep1";
import SignupStep2 from "../components/signup/SignupStep2";
import SignupStep3 from "../components/signup/SignupStep3";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Name & Email, 2: OTP, 3: Password
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.otp) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    if (validateStep1()) {
      try {
        setIsLoading(true);
        
        const response = await axios.post('/api/send-otp', {
          email: formData.email,
          name: formData.name
        });
        
        toast.success(response.data.message || "OTP sent to your email");
        setStep(2); // Move to OTP verification step
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      try {
        setIsLoading(true);
        
        const response = await axios.post('/api/verify-otp', {
          email: formData.email,
          otp: formData.otp
        });
        
        toast.success(response.data.message || "OTP verified successfully");
        setStep(3); // Move to password setup step
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitStep3 = async (e) => {
    e.preventDefault();
    if (validateStep3()) {
      try {
        setIsLoading(true);
        
        const response = await axios.post('/api/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        toast.success(response.data.message || "Account created successfully! Redirecting to login...");
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } catch (error) {
        console.error("Error creating account:", error);
        toast.error(error.response?.data?.message || "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonLabel = () => {
    switch (step) {
      case 1: return "Send OTP";
      case 2: return "Verify OTP";
      case 3: return "Create account";
      default: return "Next";
    }
  };

  const getCurrentSubmitHandler = () => {
    switch (step) {
      case 1: return handleSubmitStep1;
      case 2: return handleSubmitStep2;
      case 3: return handleSubmitStep3;
      default: return handleSubmitStep1;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* React Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Sidebar */}
      <div className="sticky top-0 h-screen bg-black">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-margin duration-200 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"} flex flex-col`}>
        <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold">Create an Account</h2>
        </div>

        {/* Signup Form Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Join Pravesh
              </h1>
              <p className="text-center text-gray-400 mb-8">Create your account to start your journey</p>

              <form className="space-y-6" onSubmit={getCurrentSubmitHandler()}>
                {step === 1 && (
                  <SignupStep1 
                    formData={formData} 
                    handleChange={handleChange} 
                    errors={errors} 
                  />
                )}

                {step === 2 && (
                  <SignupStep2 
                    formData={formData} 
                    handleChange={handleChange} 
                    errors={errors} 
                  />
                )}

                {step === 3 && (
                  <SignupStep3 
                    formData={formData} 
                    handleChange={handleChange} 
                    errors={errors} 
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowPassword={setShowPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                  />
                )}

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
                          <UserPlus size={18} className="mr-2" />
                          {getButtonLabel()}
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
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-800 bg-black text-center text-gray-500">
          <p>© 2025 PRAVESH - Empowering students through AI</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;