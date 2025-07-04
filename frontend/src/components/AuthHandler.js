import { useEffect } from 'react';

export default function AuthHandler({ children, config }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const COGNITO_DOMAIN = config.COGNITO_DOMAIN;
    const CLIENT_ID = config.COGNITO_CLIENT_ID;
    const REDIRECT_URI = window.location.origin + '/';
    if (code && COGNITO_DOMAIN && CLIENT_ID) {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', CLIENT_ID);
      params.append('code', code);
      params.append('redirect_uri', REDIRECT_URI);
      fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      })
        .then(res => {
          if (!res.ok) throw new Error('Token exchange failed');
          return res.json();
        })
        .then(tokens => {
          localStorage.setItem('id_token', tokens.id_token);
          localStorage.setItem('access_token', tokens.access_token);
          url.searchParams.delete('code');
          window.history.replaceState({}, document.title, url.pathname);
          window.location.reload();
        })
        .catch(err => {
          console.error('Token exchange failed', err);
        });
    }
  }, [config]);
  return children;
}
