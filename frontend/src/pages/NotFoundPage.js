import React from 'react';
import { Link } from 'react-router-dom';
import HeaderNavBar from '../components/HeaderNavBar';

function NotFoundPage({ config }) {
  return (
    <div className="App min-h-screen">
      <HeaderNavBar config={config} />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-6">
            Sorry, the page you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-block bg-green-600 text-white font-medium px-6 py-3 rounded shadow hover:bg-green-700 transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
