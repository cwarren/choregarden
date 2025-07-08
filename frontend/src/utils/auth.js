// Authentication utilities for Cognito integration

export const getAuthTokens = () => {
  return {
    idToken: localStorage.getItem('id_token'),
    accessToken: localStorage.getItem('access_token')
  };
};

export const isAuthenticated = () => {
  const { idToken } = getAuthTokens();
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
};

export const getUserInfo = () => {
  const { idToken } = getAuthTokens();
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
};

export const login = (cognitoDomain, clientId, redirectUri = window.location.origin + '/') => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid email profile'
  });
  
  window.location.href = `https://${cognitoDomain}/login?${params}`;
};

export const logout = (cognitoDomain, clientId, redirectUri = window.location.origin + '/') => {
  // Clear local storage
  localStorage.removeItem('id_token');
  localStorage.removeItem('access_token');
  
  // Redirect to Cognito logout endpoint
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: redirectUri
  });
  
  window.location.href = `https://${cognitoDomain}/logout?${params}`;
};

export const registerUser = async (apiBaseUrl) => {
  const { idToken } = getAuthTokens();

  // Use ID token for both API Gateway and direct backend
  // API Gateway is configured to expect client_id as audience (which ID tokens have)
  const token = idToken;
  if (!token) {
    throw new Error('No authentication token available');
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/user/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
};
