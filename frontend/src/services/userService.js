// User service for managing user data and profile operations
// Handles user registration, profile fetching, and profile updates

import { authService } from './authService';

export const userService = {
  /**
   * Register user in the application database
   */
  async registerUser(apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/user/register`, {
        method: 'POST',
        headers: authService.createAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Registration failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  /**
   * Fetch user profile from the backend
   */
  async getUserProfile(apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'GET',
        headers: authService.createAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch user profile: ${response.status} - ${errorText}`);
      }

      const userProfile = await response.json();
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(apiBaseUrl, updates) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.createAuthHeaders()
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user profile: ${response.status} - ${errorText}`);
      }

      const updatedProfile = await response.json();
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
