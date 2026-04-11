import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const QuranAuthContext = createContext();

// PKCE functions for browser
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const randomString = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const useQuranAuth = () => {
  const context = useContext(QuranAuthContext);
  if (!context) throw new Error('useQuranAuth must be used within a QuranAuthProvider');
  return context;
};

export const QuranAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('qf_user');
    const savedToken = localStorage.getItem('qf_access_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
      const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
      const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = randomString();
      const nonce = randomString();

      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
      sessionStorage.setItem('oauth_state', state);
      localStorage.setItem('qf_redirect_path', window.location.pathname);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid offline_access',
        state: state,
        nonce: nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      window.location.href = `${AUTH_BASE_URL}/oauth2/auth?${params.toString()}`;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const exchangeCodeForTokens = useCallback(async (code, state) => {
    setIsLoading(true);
    setError(null);

    try {
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('State mismatch');
      }

      const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
      const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
      const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
      const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
      const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code_verifier', codeVerifier);

      const response = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
        },
        body: params
      });

      if (!response.ok) {
        throw new Error('Token exchange failed');
      }

      const tokenData = await response.json();
      const idTokenPayload = JSON.parse(atob(tokenData.id_token.split('.')[1]));

      const user = {
        id: idTokenPayload.sub,
        name: idTokenPayload.name || 'Quran User',
        email: idTokenPayload.email,
      };

      setUser(user);
      setAccessToken(tokenData.access_token);
      localStorage.setItem('qf_user', JSON.stringify(user));
      localStorage.setItem('qf_access_token', tokenData.access_token);

      sessionStorage.removeItem('oauth_code_verifier');
      sessionStorage.removeItem('oauth_state');

      const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
      localStorage.removeItem('qf_redirect_path');
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Token exchange error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('qf_user');
    localStorage.removeItem('qf_access_token');
    window.location.href = '/';
  }, []);

  return (
    <QuranAuthContext.Provider value={{
      user,
      accessToken,
      isLoading,
      error,
      login,
      logout,
      exchangeCodeForTokens,
      isAuthenticated: !!user
    }}>
      {children}
    </QuranAuthContext.Provider>
  );
};
