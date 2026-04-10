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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('qf_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login-url`);
      const { url } = await response.json();
      localStorage.setItem('qf_redirect_path', window.location.pathname);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, []);

  const handleAuthCallback = useCallback(async (code, state) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('qf_user', JSON.stringify(data.user));
      localStorage.setItem('qf_access_token', data.accessToken);
      const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
      localStorage.removeItem('qf_redirect_path');
      window.location.href = redirectPath;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('qf_user');
    localStorage.removeItem('qf_access_token');
    window.location.href = '/';
  }, []);

  return (
    <QuranAuthContext.Provider value={{ user, isLoading, login, logout, handleAuthCallback, isAuthenticated: !!user }}>
      {children}
    </QuranAuthContext.Provider>
  );
};
