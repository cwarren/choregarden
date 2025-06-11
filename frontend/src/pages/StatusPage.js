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
    <div className="App min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Chore Garden Status</h1>
        <ul className="status-list bg-white rounded p-6 mb-8 mt-4">
            <li><b>Static site:</b> alive</li>
            <li><b>API URL:</b> {apiBaseUrl}</li>
            <li><b>API ping:</b> {apiStatus.status} {apiStatus.message && `[${apiStatus.message}]`}</li>
            <li><b>DB ping:</b> {dbStatus.status} {dbStatus.message && `[${dbStatus.message}]`}</li>
        </ul>
        <Link to="/" className="text-link text-sm">Home</Link>
    </div>
  );
}

export default StatusPage;
