import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService } from '../services';
import HeaderNavBar from '../components/HeaderNavBar';

function AccountPage({ config }) {
  const { user, authenticated, loading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  
  // State for editing display name
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Debug logging to understand the authentication state
  useEffect(() => {
    console.log('AccountPage debug:', {
      authenticated,
      loading,
      user,
      hasApiBaseUrl: !!config.REACT_APP_API_BASE_URL,
      apiBaseUrl: config.REACT_APP_API_BASE_URL
    });
  }, [authenticated, loading, user, config.REACT_APP_API_BASE_URL]);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (authenticated && config.REACT_APP_API_BASE_URL) {
      console.log('Fetching user profile...');
      setProfileLoading(true);
      userService.getUserProfile(config.REACT_APP_API_BASE_URL)
        .then(profile => {
          console.log('User profile fetched:', profile);
          setUserProfile(profile);
          setProfileError(null);
          
          // Initialize editing state with current display name
          const currentDisplayName = profile?.display_name || profile?.displayName || user?.email || '';
          setDisplayName(currentDisplayName);
          setOriginalDisplayName(currentDisplayName);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          setProfileError(error.message);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    } else {
      console.log('Not fetching profile:', { authenticated, hasApiBaseUrl: !!config.REACT_APP_API_BASE_URL });
      setProfileLoading(false);
    }
  }, [authenticated, config.REACT_APP_API_BASE_URL]);

  const handleLogout = () => {
    const { COGNITO_DOMAIN, COGNITO_CLIENT_ID } = config;
    if (COGNITO_DOMAIN && COGNITO_CLIENT_ID) {
      authService.logout(COGNITO_DOMAIN, COGNITO_CLIENT_ID);
    } else {
      console.error('Cognito configuration not available');
    }
  };

  const handleDisplayNameChange = (event) => {
    const newValue = event.target.value;
    setDisplayName(newValue);
    
    // Show save/cancel buttons if value has changed from original
    const hasChanged = newValue !== originalDisplayName;
    setIsEditing(hasChanged);
    
    // Clear any previous save messages
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!config.REACT_APP_API_BASE_URL) {
      setSaveError('API configuration not available');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updates = { displayName: displayName };
      const updatedProfile = await userService.updateUserProfile(config.REACT_APP_API_BASE_URL, updates);
      
      // Update the profile state with the response
      setUserProfile(updatedProfile);
      setOriginalDisplayName(displayName);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(originalDisplayName);
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  if (loading || profileLoading) {
    return (
      <div className="App min-h-screen">
        <HeaderNavBar config={config} />
        <div className="container mx-auto px-6 py-8">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="App min-h-screen">
        <HeaderNavBar config={config} />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Access</h1>
            <p className="text-gray-600 mb-4">You need to be logged in to view this page.</p>
            <p className="text-green-600">Please log in using the button in the header.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen">
      <HeaderNavBar config={config} />
      <div className="container mx-auto px-6 py-8 relative">
        {/* Logout button anchored to top right of content area */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-red-600 text-white font-medium px-5 py-3 rounded shadow hover:bg-red-700 transition text-base"
        >
          Log Out
        </button>
        
        <div className="max-w-md mx-auto bg-white p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address / Login
              </label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {user?.email || 'Not available'}
              </p>
            </div>
            
            <div>
              <a
                href={`https://${config.COGNITO_DOMAIN}/forgotPassword?client_id=${config.COGNITO_CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(window.location.origin + '/')}`}
                className="block text-base font-medium text-red-700 hover:text-red-800 underline mb-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Change Password
              </a>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              {profileError ? (
                <p className="text-red-600 bg-red-50 px-3 py-2 rounded border">
                  Error loading profile: {profileError}
                </p>
              ) : (
                <input
                  type="text"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  className="w-full text-gray-900 bg-gray-50 px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="Enter your display name"
                />
              )}
            </div>

            {/* Save/Cancel buttons and status messages */}
            {isEditing && (
              <div className="pt-4 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white font-medium px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-gray-500 text-white font-medium px-4 py-2 rounded shadow hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Cancel
                  </button>
                </div>
                
                {saveError && (
                  <p className="text-red-600 text-sm mt-2">
                    Error saving: {saveError}
                  </p>
                )}
              </div>
            )}

            {saveSuccess && (
              <div className="pt-2">
                <p className="text-green-600 text-sm">
                  Display name updated successfully!
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
