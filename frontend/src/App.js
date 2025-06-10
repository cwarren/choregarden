import React, { useEffect, useState } from 'react';

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
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Chore Garden</h1>
        <p>API Response: {apiResponse}</p>
      </header>
    </div>
  );
}

export default App;