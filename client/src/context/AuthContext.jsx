import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check user authentication
        const userResponse = await fetch('/api/me', {
          credentials: 'include'
        });
        
        // Check admin authentication
        const adminResponse = await fetch('/api/admin/me', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const data = await userResponse.json();
          setCurrentUser(data.user);
          setUserType('user');
          
          if (data.user && data.user.id) {
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userType', 'user');
          }
        } else if (adminResponse.ok) {
          const data = await adminResponse.json();
          setCurrentUser(data.user);
          setUserType('admin');
          
          if (data.user && data.user.id) {
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userType', 'admin');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    setError(null);
    try {
      const endpoint = isAdmin ? '/api/admin/login' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setCurrentUser(data.user);
      setUserType(isAdmin ? 'admin' : 'user');
      
      // Save userId and userType to localStorage
      if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userType', isAdmin ? 'admin' : 'user');
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adminLogin = async (email, password) => {
    return login(email, password, true);
  };

  const logout = async (isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/api/admin/logout' : '/api/logout';
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include'
      });
      
      setCurrentUser(null);
      setUserType(null);
      
      // Remove userId and userType from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('userType');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  const adminLogout = async () => {
    return logout(true);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    adminLogin,
    logout,
    adminLogout,
    userType,
    isAuthenticated: !!currentUser,
    isAdmin: userType === 'admin',
    isUser: userType === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};