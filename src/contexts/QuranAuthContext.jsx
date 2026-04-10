import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_BASE_URL = '';

const QuranAuthContext = createContext();

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

  // Step 1 & 2: User clicks Sign In -> Fetch login URL
  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[1] Fetching login URL from /api/auth/login-url');
      const response = await fetch(`${API_BASE_URL}/api/auth/login-url`);
      if (!response.ok) throw new Error('Failed to get login URL');
      const { url } = await response.json();
      console.log('[2] Redirecting to Quran Foundation');
      localStorage.setItem('qf_redirect_path', window.location.pathname);
      window.location.href = url;  // Step 4
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Step 7: AuthCallback sends code to exchange
  const handleAuthCallback = useCallback(async (code, state) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[7] Exchanging code for tokens at /api/auth/exchange');
      const response = await fetch(`${API_BASE_URL}/api/auth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Token exchange failed');
      }

      const data = await response.json();
      
      // Step 9: User is signed in!
      console.log('[9] User signed in:', data.user);
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem('qf_user', JSON.stringify(data.user));
      localStorage.setItem('qf_access_token', data.accessToken);

      const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
      localStorage.removeItem('qf_redirect_path');
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Callback error:', err);
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
      user, accessToken, isLoading, error, 
      login, logout, handleAuthCallback, 
      isAuthenticated: !!user 
    }}>
      {children}
    </QuranAuthContext.Provider>
  );
};
