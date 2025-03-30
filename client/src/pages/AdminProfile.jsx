import React, { useState, useEffect, useRef } from "react";
import { 
  Settings, 
  LogOut, 
  Upload, 
  Trash2, 
  Shield, 
  Database, 
  ListChecks, 
  Activity,
  FileUp,
  FileText,
  FileX 
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const response = await fetch(`/api/admin/profile?userId=${currentUser._id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        
        // Enhance profile data with additional computed fields
        const enhancedProfileData = {
          ...data,
          profilePicture: `/api/placeholder/200/200?text=${encodeURIComponent(data.name)}`,
          accessLevel: data.isVerified ? 'Full System Access' : 'Restricted Access',
          totalUsers: Math.floor(Math.random() * 5000) + 500,
          activeProjects: Math.floor(Math.random() * 100) + 10
        };

        setProfileData(enhancedProfileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfileData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };

  // New method for PDF upload
  const handleUploadPDF = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);
      
      const data = await res.json();
      toast.success(`PDF uploaded: ${data.message || 'Success'}`);
      
      // Reset file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(`Error uploading PDF: ${error.message}`);
    }
  };

  // New method for clearing all data
  const handleClearAllData = async () => {
    const confirmClear = window.confirm("WARNING: This will delete all uploaded data. Are you absolutely sure?");
    
    if (confirmClear) {
      try {
        const res = await fetch('http://127.0.0.1:8000/delete-all-data', {
          method: 'DELETE',
        });
        
        if (!res.ok) throw new Error(`Delete failed with status: ${res.status}`);
        const data = await res.json();
        toast.info('All data cleared successfully');
        
        // Reset file input if needed
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        toast.error(`Error clearing data: ${error.message}`);
      }
    }
  };

  // Spinner Loader Component
  const Loader = () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="sticky top-0 h-screen bg-black">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      </div>

      <div className={`flex-1 transition-margin duration-200 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"} flex flex-col`}>
        {/* Admin Dashboard Header */}
        <div className="p-6 border-b border-gray-800 bg-black">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="mr-3 text-blue-500" />
            Admin Dashboard
          </h2>
        </div>

        {/* Admin Profile Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-black">
          {profileData ? (
            <div className="flex flex-col items-center justify-center">
              <div className="max-w-4xl w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 text-center">
                    <img 
                      src={profileData.profilePicture} 
                      alt="Admin Profile" 
                      className="mx-auto w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
                    />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                      {profileData.name}
                    </h1>
                    <p className="text-gray-400 mt-2">{profileData.email}</p>
   
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center bg-gray-800 rounded-lg p-3">
                        <Shield className="mr-3 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-400">Role</p>
                          <p className="font-semibold">{profileData.role}</p>
                        </div>
                      </div>
   
                      <div className="flex items-center bg-gray-800 rounded-lg p-3">
                        <ListChecks className="mr-3 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-400">Access Level</p>
                          <p className="font-semibold">{profileData.accessLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="bg-gray-800 rounded-2xl p-6 mb-4">
                      <h3 className="text-xl font-bold mb-6 flex items-center">
                        <Activity className="mr-3 text-purple-500" />
                        College Information
                      </h3>
   
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900 rounded-lg p-4">
                          <p className="text-sm text-gray-400">College Name</p>
                          <p className="font-semibold">{profileData.collegeName}</p>
                        </div>
   
                        <div className="bg-gray-900 rounded-lg p-4">
                          <p className="text-sm text-gray-400">College Code</p>
                          <p className="font-semibold">{profileData.collegeCode}</p>
                        </div>
   
                        <div className="bg-gray-900 rounded-lg p-4">
                          <p className="text-sm text-gray-400">Location</p>
                          <p className="font-semibold">{`${profileData.collegeCity}, ${profileData.collegeState}`}</p>
                        </div>
   
                        <div className="bg-gray-900 rounded-lg p-4">
                          <p className="text-sm text-gray-400">NAAC Number</p>
                          <p className="font-semibold">{profileData.naacNumber}</p>
                        </div>
                      </div>
                    </div>
   
                    {/* PDF Upload Section */}
                    <div className="bg-gray-800 rounded-2xl p-6 mt-4">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <FileUp className="mr-3 text-green-500" />
                        PDF Upload & Data Management
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept=".pdf" 
                            onChange={(e) => {
                              const selectedFile = e.target.files[0];
                              setFile(selectedFile);
                            }}
                            className="hidden"
                            id="pdf-upload"
                          />
                          <label 
                            htmlFor="pdf-upload" 
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                          >
                            <FileUp className="mr-2" /> Select PDF
                          </label>
                          
                          {file && (
                            <div className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg">
                              <FileText className="mr-2" />
                              <span className="mr-2 truncate max-w-[200px]">
                                {file.name}
                              </span>
                              <button 
                                onClick={() => {
                                  setFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                                className="hover:text-red-300"
                              >
                                <FileX size={16} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={handleUploadPDF}
                            disabled={!file}
                            className={`px-4 py-2 rounded-lg ${
                              file 
                                ? "bg-blue-600 hover:bg-blue-700" 
                                : "bg-gray-600 cursor-not-allowed"
                            }`}
                          >
                            Upload PDF
                          </button>
                        </div>

                        <button
                          onClick={handleClearAllData}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition flex items-center justify-center"
                        >
                          <Trash2 className="mr-2" /> Clear All Uploaded Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Loader />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-black text-center text-gray-500">
          <p>© 2025 PRAVESH - Empowering students through AI</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;