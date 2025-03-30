import React, { useState } from "react";
import { UserPlus, School, FileText, MapPin, Mail, Key, Hash, Phone, ArrowRight, KeyRound, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import FormInput from "../components/signup/FormInput";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; 

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    collegeName: "",
    phoneNumber: "",
    naacNumber: "",
    collegeCode: "",
    city: "",
    state: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [attemptCount, setAttemptCount] = useState(5);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const navigate = useNavigate(); // For programmatic navigation

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (otpError) setOtpError("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  const validateSignupForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Director name is required";
    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";
    if (!validatePhone(formData.phoneNumber)) newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    if (!formData.naacNumber.trim()) newErrors.naacNumber = "NAAC number is required";
    if (!formData.collegeCode.trim()) newErrors.collegeCode = "College code is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (validateSignupForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/admin/send-otp', {
          email: formData.email,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          naacNumber: formData.naacNumber,
          collegeCode: formData.collegeCode,
          city: formData.city,
          state: formData.state,
          password: formData.password,
          collegeName: formData.collegeName,
        });

        if (response.status === 200) {
          setOtpSent(true);
          toast.success("OTP sent successfully to your email");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setOtpError("Please enter the OTP");
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/admin/verify-otp', {
        email: formData.email,
        otp: otp,
      });

      if (response.status === 200) {
        setOtpVerified(true);
        setRegistrationComplete(true);
        toast.success("Account created successfully! You can now login.");
        setTimeout(() => navigate("/admin/login"), 3000); // Redirect to login after 3 seconds
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to verify OTP. Please try again.");
      toast.error(error.response?.data?.message || "Failed to verify OTP. Please try again.");
      if (error.response?.data?.attemptsLeft) {
        setAttemptCount(error.response.data.attemptsLeft);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/admin/send-otp', {
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        naacNumber: formData.naacNumber,
        collegeCode: formData.collegeCode,
        city: formData.city,
        state: formData.state,
        password: formData.password,
        collegeName: formData.collegeName,
      });

      if (response.status === 200) {
        setOtpError("");
        setAttemptCount(5);
        toast.info("OTP has been resent to your email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      <div className="flex-1 transition-margin duration-200 ease-in-out">
      <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold">Welcome Admin </h2>
        </div>
        <div className="flex items-center justify-center min-h-screen py-8 px-4">
          <div className="max-w-2xl w-full relative">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-filter backdrop-blur-sm bg-opacity-90">
              <div className="px-8 py-10">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-4 rounded-full">
                    <School size={36} className="text-white" />
                  </div>
                </div>
                <h2 className="text-center text-3xl font-bold text-white mb-1">College Director Sign Up</h2>
                <p className="text-center text-gray-400 mb-8">Register your college for document management</p>
                {errors.submitError && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{errors.submitError}</div>
                )}
                {!otpSent ? (
                  <form className="space-y-6" onSubmit={handleSendOtp}>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormInput label="Director Name" type="text" name="name" value={formData.name} onChange={handleSignupChange} placeholder="Enter director name" error={errors.name} icon={<UserPlus size={16} className="text-gray-400" />} />
                      <FormInput label="College Name" type="text" name="collegeName" value={formData.collegeName} onChange={handleSignupChange} placeholder="Enter college name" error={errors.collegeName} icon={<School size={16} className="text-gray-400" />} />
                      <FormInput label="Phone Number" type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleSignupChange} placeholder="Enter 10-digit number" error={errors.phoneNumber} icon={<Phone size={16} className="text-gray-400" />} />
                      <FormInput label="NAAC Number" type="text" name="naacNumber" value={formData.naacNumber} onChange={handleSignupChange} placeholder="Enter NAAC accreditation number" error={errors.naacNumber} icon={<Hash size={16} className="text-gray-400" />} />
                      <FormInput label="College Code" type="text" name="collegeCode" value={formData.collegeCode} onChange={handleSignupChange} placeholder="Enter college code" error={errors.collegeCode} icon={<FileText size={16} className="text-gray-400" />} />
                      <FormInput label="City" type="text" name="city" value={formData.city} onChange={handleSignupChange} placeholder="Enter city" error={errors.city} icon={<MapPin size={16} className="text-gray-400" />} />
                      <FormInput label="State" type="text" name="state" value={formData.state} onChange={handleSignupChange} placeholder="Enter state" error={errors.state} icon={<MapPin size={16} className="text-gray-400" />} />
                    </div>
                    <div className="pt-2">
                      <FormInput label="Director Email" type="email" name="email" value={formData.email} onChange={handleSignupChange} placeholder="Enter your email" error={errors.email} icon={<Mail size={16} className="text-gray-400" />} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormInput label="Password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleSignupChange} placeholder="Create a password" error={errors.password} icon={<Key size={16} className="text-gray-400" />} showPasswordToggle onTogglePasswordVisibility={() => setShowPassword(!showPassword)} />
                      <FormInput label="Confirm Password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleSignupChange} placeholder="Confirm your password" error={errors.confirmPassword} icon={<Key size={16} className="text-gray-400" />} showPasswordToggle onTogglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                    <div className="mt-8">
                      <button type="submit" disabled={isLoading} className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${isLoading ? "bg-indigo-800" : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]`}>
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <span className="flex items-center">
                              <Mail size={18} className="mr-2" />
                              Send Verification OTP
                            </span>
                            <span className="absolute right-3 inset-y-0 flex items-center">
                              <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : !otpVerified ? (
                  <div className="space-y-6">
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
                      <p className="text-blue-200 text-sm">A verification code has been sent to <span className="font-semibold">{formData.email}</span>. Please check your email and enter the OTP below.</p>
                    </div>
                    <form onSubmit={handleVerifyOtp}>
                      <div className="mb-6">
                        <FormInput label="OTP Verification Code" type="text" name="otp" value={otp} onChange={handleOtpChange} placeholder="Enter 4-digit OTP" error={otpError} icon={<KeyRound size={16} className="text-gray-400" />} />
                        {otpError && attemptCount > 0 && <p className="mt-2 text-amber-400 text-xs">{attemptCount} attempts remaining before OTP is reset</p>}
                      </div>
                      <div className="flex flex-col space-y-3">
                        <button type="submit" disabled={isLoading} className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${isLoading ? "bg-indigo-800" : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300`}>
                          {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <span className="flex items-center">
                              <KeyRound size={18} className="mr-2" />
                              Verify OTP
                            </span>
                          )}
                        </button>
                        <div className="flex justify-between text-sm">
                          <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-blue-400 hover:text-blue-300 transition-colors duration-200">Resend OTP</button>
                          <button type="button" onClick={() => setOtpSent(false)} className="text-gray-400 hover:text-gray-300 transition-colors duration-200">Edit Information</button>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center mb-4">
                      <CheckCircle size={60} className="text-green-400" />
                    </div>
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                      <h3 className="text-xl font-bold text-green-400 mb-2">Registration Successful!</h3>
                      <p className="text-green-200">Your college has been successfully registered. You will be redirected to the login page shortly.</p>
                    </div>
                  </div>
                )}
              </div>
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

export default AdminSignup;