import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((cfg) => {
        setApiBaseUrl(cfg.REACT_APP_API_BASE_URL || 'http://localhost:5000');
        setConfigLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load config.json:', err);
        setApiBaseUrl('http://localhost:5000');
        setConfigLoaded(true);
      });
  }, []);

  if (!configLoaded) {
    return <div className="App"><header className="App-header"><p>Loading config...</p></header></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/status" element={<StatusPage apiBaseUrl={apiBaseUrl} />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;