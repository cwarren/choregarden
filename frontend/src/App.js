import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function StatusPage({ apiBaseUrl }) {
  const [apiStatus, setApiStatus] = useState({ status: 'loading', message: '' });
  const [dbStatus, setDbStatus] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    // API ping
    fetch(`${apiBaseUrl}/api/ping`)
      .then((res) => res.json())
      .then((data) => setApiStatus({ status: 'alive', message: data.message }))
      .catch((err) => setApiStatus({ status: 'unresponsive', message: err.message }));
    // DB ping
    fetch(`${apiBaseUrl}/api/pingdeep`)
      .then((res) => res.json())
      .then((data) => setDbStatus({ status: 'alive', message: JSON.stringify(data) }))
      .catch((err) => setDbStatus({ status: 'unresponsive', message: err.message }));
  }, [apiBaseUrl]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Status Page</h1>
        <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
          <li><b>Static site:</b> alive</li>
          <li><b>API ping:</b> {apiStatus.status} {apiStatus.message && `[${apiStatus.message}]`}</li>
          <li><b>DB ping:</b> {dbStatus.status} {dbStatus.message && `[${dbStatus.message}]`}</li>
        </ul>
        <Link to="/">Back to Home</Link>
      </header>
    </div>
  );
}

function App() {
  const [apiResponse, setApiResponse] = useState('');
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

  useEffect(() => {
    if (!configLoaded || !apiBaseUrl) return;
    fetch(`${apiBaseUrl}/api/ping`)
      .then((response) => response.json())
      .then((data) => setApiResponse(data.message))
      .catch((error) => console.error('Error fetching API:', error));
  }, [configLoaded, apiBaseUrl]);

  if (!configLoaded) {
    return <div className="App"><header className="App-header"><p>Loading config...</p></header></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/status" element={<StatusPage apiBaseUrl={apiBaseUrl} />} />
        <Route path="/" element={
          <div className="App">
            <header className="App-header">
              <h1>Welcome to Chore Garden</h1>
              <Link to="/status">Status Page</Link>
            </header>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;