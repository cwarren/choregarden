import React, { useEffect, useState } from 'react';

function App() {
  const [apiResponse, setApiResponse] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/ping`)
      .then((response) => response.json())
      .then((data) => setApiResponse(data.message))
      .catch((error) => console.error('Error fetching API:', error));
  }, []);

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