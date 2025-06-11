import React from 'react';
import { Link } from 'react-router-dom';
import HeaderNavBar from '../components/HeaderNavBar';

function HomePage() {
  return (
    <div className="App min-h-screen relative">
      <HeaderNavBar onLogin={() => { /* TODO: implement login */ }} />
      <Link
        to="/status"
        className="absolute right-4 bottom-4 text-xs text-link"
        style={{ letterSpacing: 0.5 }}
      >
        status
      </Link>
    </div>
  );
}

export default HomePage;
