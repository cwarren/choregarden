import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StatusPage({ apiBaseUrl }) {
  const [apiStatus, setApiStatus] = useState({ status: 'loading', message: '' });
  const [dbStatus, setDbStatus] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    // API ping
    fetch(`${apiBaseUrl}/api/ping`)
      .then((res) => res.json())
      .then((data) => setApiStatus({ status: 'alive', message: JSON.stringify(data) }))
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
        <h1>Chore Garden Status Page</h1>
        <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
          <li><b>Static site:</b> alive</li>
          <li><b>API URL:</b> {apiBaseUrl}</li>
          <li><b>API ping:</b> {apiStatus.status} {apiStatus.message && `[${apiStatus.message}]`}</li>
          <li><b>DB ping:</b> {dbStatus.status} {dbStatus.message && `[${dbStatus.message}]`}</li>
        </ul>
        <Link to="/">Back to Home</Link>
      </header>
    </div>
  );
}

export default StatusPage;
