import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Chore Garden</h1>
        <Link to="/status">Status Page</Link>
      </header>
    </div>
  );
}

export default HomePage;
