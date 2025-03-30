import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (loginError) setLoginError("");
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};
    if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const result = await login(formData.email, formData.password);
        navigate("/chat");
      } catch (error) {
        setLoginError(error.message || "Login failed. Please check your credentials and try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="sticky top-0 h-screen bg-black">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className={`flex-1 transition-margin duration-200 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"} flex flex-col`}>
        <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold">Login</h2>
        </div>

        {/* Login Form Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-center text-gray-400 mb-8">Sign in to continue your Pravesh journey</p>

              {loginError && (
                <div className="mb-6 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200">
                  {loginError}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
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

                  <FormInput
                    id="password"
                    name="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    error={errors.password}
                    icon={Lock}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    autoComplete="current-password"
                  />
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
                          <LogIn size={18} className="mr-2" />
                          Sign in
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
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up
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

export default Login;