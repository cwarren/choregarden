import React, { useEffect, useState } from 'react';

function App() {
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/ping')
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