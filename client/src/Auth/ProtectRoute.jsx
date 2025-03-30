import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedTypes = ['user', 'admin'] }) => {
  const { currentUser, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (currentUser && allowedTypes.includes(userType)) {
    return <Outlet />;
  }

  // Redirect based on user type
  if (userType === 'admin') {
    return <Navigate to="/admin/login" />;
  }

  return <Navigate to="/login" />;
};

export const PublicOnlyRoute = () => {
  const { currentUser, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  // Redirect based on user type
  if (currentUser) {
    if (userType === 'admin') {
      return <Navigate to="/admin/profile" />;
    }
    return <Navigate to="/chat" />;
  }

  return <Outlet />;
};

export const AdminProtectedRoute = () => {
  const { currentUser, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  // Check if current user is an admin
  if (currentUser && userType === 'admin') {
    return <Outlet />;
  }

  return <Navigate to="/admin/login" />;
};