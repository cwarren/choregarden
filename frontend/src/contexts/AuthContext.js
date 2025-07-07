import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserInfo, getAuthTokens } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        const userInfo = getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
    
    // Listen for storage changes (logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'id_token' || e.key === 'access_token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    user,
    authenticated,
    loading,
    tokens: getAuthTokens(),
    refreshAuth: () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      
      if (isAuth) {
        const userInfo = getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
