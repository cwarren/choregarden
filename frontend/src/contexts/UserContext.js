import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children, config = {} }) => {
  const { authenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const fetchUserProfile = useCallback(async (apiBaseUrl) => {
    if (!authenticated) {
      setUserProfile(null);
      setProfileError(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const profile = await userService.getUserProfile(apiBaseUrl);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
      setProfileError(error.message);
    } finally {
      setProfileLoading(false);
    }
  }, [authenticated]);

  const updateUserProfile = async (apiBaseUrl, updates) => {
    try {
      const updatedProfile = await userService.updateUserProfile(apiBaseUrl, updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  // Fetch profile when user becomes authenticated
  useEffect(() => {
    if (authenticated && config.REACT_APP_API_BASE_URL) {
      fetchUserProfile(config.REACT_APP_API_BASE_URL);
    } else if (!authenticated) {
      // Clear user data when not authenticated
      setUserProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  }, [authenticated, config.REACT_APP_API_BASE_URL]);

  const value = {
    userProfile,
    profileLoading,
    profileError,
    refreshUserProfile: () => {
      if (authenticated && config.REACT_APP_API_BASE_URL) {
        fetchUserProfile(config.REACT_APP_API_BASE_URL);
      }
    },
    updateUserProfile: (updates) => {
      if (!config.REACT_APP_API_BASE_URL) {
        throw new Error('API configuration not available');
      }
      return updateUserProfile(config.REACT_APP_API_BASE_URL, updates);
    },
    clearUserData: () => {
      setUserProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
