import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function StatusPage({ config }) {
  const [apiStatus, setApiStatus] = useState({ status: 'loading', message: '' });
  const [dbStatus, setDbStatus] = useState({ status: 'loading', message: '' });
  const [protectedApiStatusCode, setProtectedApiStatusCode] = useState({ status: 'loading', message: '' });
  const [protectedApiStatusNoCode, setProtectedApiStatusNoCode] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    const apiBaseUrl = config.REACT_APP_API_BASE_URL;
    
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

    // Protected API ping with code (token)
    const token = localStorage.getItem('id_token') || sessionStorage.getItem('id_token') || localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      fetch(`${apiBaseUrl}/api/pingprotected`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json().then(data => ({ ok: res.ok, status: res.status, data })))
        .then(({ ok, status, data }) => {
          setProtectedApiStatusCode({ status: ok ? 'success' : 'fail', message: `[${status}] ${JSON.stringify(data)}` });
        })
        .catch((err) => setProtectedApiStatusCode({ status: 'fail', message: err.message }));
    } else {
      setProtectedApiStatusCode({ status: 'NA', message: 'Not logged in' });
    }

    // Protected API ping without code
    fetch(`${apiBaseUrl}/api/pingprotected`)
      .then((res) => res.json().then(data => ({ ok: res.ok, status: res.status, data })))
      .then(({ ok, status, data }) => {
        setProtectedApiStatusNoCode({ status: ok ? 'success' : 'fail', message: `[${status}] ${JSON.stringify(data)}` });
      })
      .catch((err) => setProtectedApiStatusNoCode({ status: 'fail', message: err.message }));

  }, [config.REACT_APP_API_BASE_URL]);

  return (
    <div className="App min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Chore Garden Status</h1>
        <ul className="status-list bg-white rounded p-6 mb-8 mt-4" style={{ maxWidth: '90%' }}>
            <li><b>Static site:</b> alive, deployed version FE20250725.1</li>
            <li><b>API URL:</b> {config.REACT_APP_API_BASE_URL}</li>
            <li><b>Public API ping, public:</b> {apiStatus.status} {apiStatus.message && `[${apiStatus.message}]`}</li>
            <li><b>Public DB ping:</b> {dbStatus.status} {dbStatus.message && `[${dbStatus.message}]`}</li>
            <li><b>Protected API ping, with code:</b> {protectedApiStatusCode.status} {protectedApiStatusCode.message && `[${protectedApiStatusCode.message}]`}</li>
            <li><b>Protected API ping, without code (should fail):</b> {protectedApiStatusNoCode.status} {protectedApiStatusNoCode.message && `[${protectedApiStatusNoCode.message}]`}</li>
        </ul>
        <Link to="/" className="text-link text-sm">home</Link>
    </div>
  );
}

export default StatusPage;
