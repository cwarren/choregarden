import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import AuthHandler from './providers/AuthHandler';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [config, setConfig] = useState({});
  const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
    fetch('/config.json')
      .then((res) => res.json())
      .then((cfg) => {
        setConfig(cfg);
        setConfigLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load config.json:', err);
        setConfig({});  // Empty config - let it fail obviously
        setConfigLoaded(true);
      });
  }, []);

  if (!configLoaded) {
    return <div className="App"><header className="App-header"><p>Loading config...</p></header></div>;
  }

  return (
    <AuthProvider config={config}>
      <UserProvider config={config}>
        <AuthHandler config={config}>
          <Router>
            <Routes>
              <Route path="/status" element={<StatusPage config={config} />} />
              <Route path="/account" element={<AccountPage config={config} />} />
              <Route path="/" element={<HomePage config={config} />} />
              <Route path="*" element={<NotFoundPage config={config} />} />
            </Routes>
          </Router>
        </AuthHandler>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;