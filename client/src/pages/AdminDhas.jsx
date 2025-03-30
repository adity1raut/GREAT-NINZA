import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, LogIn, Server, ShieldCheck } from "lucide-react";
import Sidebar from "../components/Sidebar";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate("/admin/signup");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="sticky top-0 h-screen bg-black">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className={`flex-1 transition-margin duration-200 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"} flex flex-col`}>
        <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold flex items-center">
            <Server size={24} className="mr-3" />
            Admin Dashboard
          </h2>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-black">
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <p className="text-center text-gray-400 mb-8">Manage your PRAVESH platform</p>

              <div className="space-y-6">
                <button
                  onClick={handleCreateAccount}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="flex items-center">
                    <UserPlus size={18} className="mr-2" />
                    Create Admin Account
                  </span>
                </button>

                <button
                  onClick={handleAdminLogin}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="flex items-center">
                    <LogIn size={18} className="mr-2" />
                    Admin Login
                  </span>
                </button>
              </div>

              <div className="mt-8 text-center bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-emerald-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-200">Security Notice</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Access to this dashboard is restricted. Only authorized personnel with valid credentials can proceed.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black text-center text-gray-500">
          <p>© 2025 PRAVESH - Secure Admin Management</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;