// Authentication service for Cognito integration
// Handles login, logout, token management, and auth state

export const authService = {
  /**
   * Get authentication tokens from localStorage
   */
  getAuthTokens() {
    return {
      idToken: localStorage.getItem('id_token'),
      accessToken: localStorage.getItem('access_token')
    };
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    const { idToken } = this.getAuthTokens();
    if (!idToken) return false;
    
    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },

  /**
   * Extract user information from ID token
   */
  getUserInfoFromToken() {
    const { idToken } = this.getAuthTokens();
    if (!idToken) return null;
    
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return {
        email: payload.email,
        name: payload.name || payload['cognito:username'],
        username: payload['cognito:username']
      };
    } catch (error) {
      console.error('Error parsing user info:', error);
      return null;
    }
  },

  /**
   * Redirect to Cognito login page
   */
  login(cognitoDomain, clientId, redirectUri = window.location.origin + '/') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid email profile'
    });
    
    window.location.href = `https://${cognitoDomain}/login?${params}`;
  },

  /**
   * Logout user and redirect to Cognito logout page
   */
  logout(cognitoDomain, clientId, redirectUri = window.location.origin + '/') {
    // Clear local storage
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    
    // Redirect to Cognito logout endpoint
    const params = new URLSearchParams({
      client_id: clientId,
      logout_uri: redirectUri
    });
    
    window.location.href = `https://${cognitoDomain}/logout?${params}`;
  },

  /**
   * Create authenticated request headers for API calls
   */
  createAuthHeaders() {
    const { idToken } = this.getAuthTokens();
    
    if (!idToken) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    };
  }
};
