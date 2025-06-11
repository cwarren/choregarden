import React from 'react';
import { Link } from 'react-router-dom';

function HeaderNavBar({ onLogin }) {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#baf595' }}>
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-bold text-green-800 tracking-tight">Chore Garden</Link>
      </div>
      <div>
        <button
          onClick={onLogin}
          className="bg-white text-green-700 font-semibold px-4 py-2 rounded shadow hover:bg-green-100 border border-green-300 transition"
        >
          Log In
        </button>
      </div>
    </header>
  );
}

export default HeaderNavBar;
