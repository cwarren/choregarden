import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import AccountPage from './pages/AccountPage';
import AuthHandler from './components/AuthHandler';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [config, setConfig] = useState({});
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((cfg) => {
        setApiBaseUrl(cfg.REACT_APP_API_BASE_URL || 'http://localhost:5000');
        setConfig(cfg);
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
    <AuthProvider>
      <AuthHandler config={config}>
        <Router>
          <Routes>
            <Route path="/status" element={<StatusPage apiBaseUrl={apiBaseUrl} />} />
            <Route path="/account" element={<AccountPage config={config} />} />
            <Route path="/" element={<HomePage config={config} />} />
          </Routes>
        </Router>
      </AuthHandler>
    </AuthProvider>
  );
}

export default App;