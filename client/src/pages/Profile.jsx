import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import UserCard from "../components/profile/UserCard";
import ActionButtons from "../components/profile/ActionButtons";
import SearchHistory from "../components/profile/SearchHistory";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle } from "lucide-react";

const Profile = () => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user ID and token once on component mount
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!userId) {
          throw new Error('No user ID found. Please log in.');
        }

        const response = await axios.get('/api/profile', {
          params: { userId },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch profile");
        setLoading(false);
        toast.error(err.response?.data?.message || "Failed to load profile data", {
          position: "top-right",
          autoClose: 3000
        });
      }
    };

    fetchProfileData();
  }, [userId, token]);

  const handleDeleteHistory = async () => {
    if (isDeleting) return; // Prevent multiple delete requests
    
    try {
      setIsDeleting(true);
      
      // Send the userId as a query parameter
      await axios.delete('/api/search-history', {
        params: { userId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state to reflect the changes
      setProfileData(prev => ({
        ...prev,
        searchHistory: []
      }));

      toast.success('Search history deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        icon: <CheckCircle size={18} className="text-white" />
      });
    } catch (error) {
      console.error("Error deleting search history:", error);
      toast.error(error.response?.data?.message || 'Failed to delete search history', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSearchItem = async (id) => {
    if (!id || isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      // Send the userId as a query parameter
      await axios.delete(`/api/search-history/${id}`, {
        params: { userId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state to reflect the changes
      setProfileData(prev => ({
        ...prev,
        searchHistory: prev.searchHistory.filter(item => item.id !== id)
      }));

      toast.success(`Search item deleted!`, {
        position: "top-right",
        autoClose: 2000
      });
    } catch (error) {
      console.error("Error deleting search item:", error);
      toast.error(error.response?.data?.message || 'Failed to delete search item', {
        position: "top-right",
        autoClose: 2000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartNewChat = () => {
    toast.info('Starting new chat...', {
      position: "top-right",
      autoClose: a2000
    });
    // Implement navigation or chat initiation logic
  };

  // Remove explicit loader
  if (error) {
    return (
      <div className="flex min-h-screen bg-black text-white justify-center items-center">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  // Render skeleton or partial content while loading
  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-1 p-4 md:p-8 opacity-50">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-32 bg-gray-800 rounded mb-6"></div>
            <div className="h-16 bg-gray-800 rounded mb-6"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <UserCard user={profileData} />
          <ActionButtons 
            onStartNewChat={handleStartNewChat} 
            onDeleteHistory={handleDeleteHistory}
            isDeleting={isDeleting}
          />
          <SearchHistory
            searchHistory={profileData.searchHistory}
            isExpanded={isHistoryExpanded}
            onToggle={() => setIsHistoryExpanded(!isHistoryExpanded)}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onDeleteSearchItem={handleDeleteSearchItem}
            isDeleting={isDeleting}
          />
          <div className="mt-8 text-center text-gray-500 text-sm py-4">
            © {new Date().getFullYear()} • Last updated: March 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;