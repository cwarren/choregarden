import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService } from '../services';
import HeaderNavBar from '../components/HeaderNavBar';

function AccountPage({ config }) {
  const { user, authenticated, loading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (authenticated && config.API_BASE_URL) {
      setProfileLoading(true);
      userService.getUserProfile(config.API_BASE_URL)
        .then(profile => {
          setUserProfile(profile);
          setProfileError(null);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          setProfileError(error.message);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    }
  }, [authenticated, config.API_BASE_URL]);

  const handleLogout = () => {
    const { COGNITO_DOMAIN, COGNITO_CLIENT_ID } = config;
    if (COGNITO_DOMAIN && COGNITO_CLIENT_ID) {
      authService.logout(COGNITO_DOMAIN, COGNITO_CLIENT_ID);
    } else {
      console.error('Cognito configuration not available');
    }
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
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                  {userProfile?.display_name || userProfile?.displayName || 'Not available'}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
