import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services';

function HeaderNavBar({ config = {} }) {
  const { authenticated, user, loading } = useAuth();
  const { userProfile } = useUser();

  const handleLogin = () => {
    const { COGNITO_DOMAIN, COGNITO_CLIENT_ID } = config;
    if (COGNITO_DOMAIN && COGNITO_CLIENT_ID) {
      authService.login(COGNITO_DOMAIN, COGNITO_CLIENT_ID);
    } else {
      console.error('Cognito configuration not available');
    }
  };

  if (loading) {
    return (
      <header className="w-full flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#baf595' }}>
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-green-800 tracking-tight">Chore Garden</Link>
        </div>
        <div className="text-green-700">Loading...</div>
      </header>
    );
  }

  return (
    <header className="w-full flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#baf595' }}>
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-green-800 tracking-tight">Chore Garden</Link>
      </div>
      <div className="flex items-center space-x-4">
        {authenticated ? (
          <Link
            to="/account"
            className="text-green-700 hover:text-green-800 font-medium underline"
          >
            {userProfile?.display_name || userProfile?.displayName || user?.email || 'Account'}
          </Link>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-white text-green-700 font-semibold px-4 py-2 rounded shadow hover:bg-green-100 border border-green-300 transition"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}

export default HeaderNavBar;
