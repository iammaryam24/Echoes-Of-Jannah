import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_BASE_URL = '';  // ← EMPTY STRING for Vercel

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
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('qf_user');
    const savedToken = localStorage.getItem('qf_access_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      loadReflections(savedToken);
    }
  }, []);

  const loadReflections = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/reflections`, {
        headers: {
          'x-auth-token': token,
          'x-client-id': '911c5b21-975f-4610-be81-f7158e7e6047'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReflections(data.reflections || []);
      }
    } catch (error) {
      console.error('Load reflections error:', error);
    }
  };

  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login-url`);
      if (!response.ok) throw new Error('Failed to get login URL');
      const { url } = await response.json();
      localStorage.setItem('qf_redirect_path', window.location.pathname);
      window.location.href = url;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const handleAuthCallback = useCallback(async (code, state) => {
    setIsLoading(true);
    setError(null);
    try {
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
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem('qf_user', JSON.stringify(data.user));
      localStorage.setItem('qf_access_token', data.accessToken);
      await loadReflections(data.accessToken);

      const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
      localStorage.removeItem('qf_redirect_path');
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Callback error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const saveReflection = useCallback(async (reflectionData) => {
    if (!accessToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/reflections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': accessToken,
          'x-client-id': '911c5b21-975f-4610-be81-f7158e7e6047'
        },
        body: JSON.stringify(reflectionData)
      });

      if (!response.ok) throw new Error('Failed to save reflection');
      const newReflection = await response.json();
      setReflections(prev => [newReflection, ...prev]);
      return newReflection;
    } catch (error) {
      console.error('Save reflection error:', error);
      return null;
    }
  }, [accessToken]);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setReflections([]);
    localStorage.removeItem('qf_user');
    localStorage.removeItem('qf_access_token');
    window.location.href = '/';
  }, []);

  return (
    <QuranAuthContext.Provider value={{ 
      user, accessToken, isLoading, error, reflections,
      login, logout, handleAuthCallback, saveReflection,
      isAuthenticated: !!user 
    }}>
      {children}
    </QuranAuthContext.Provider>
  );
};
