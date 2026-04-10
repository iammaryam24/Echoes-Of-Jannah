// src/contexts/QuranAuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// IMPORTANT: Empty string means use same domain (Vercel serverless functions)
const API_BASE_URL = '';

const QuranAuthContext = createContext();

export const useQuranAuth = () => {
    const context = useContext(QuranAuthContext);
    if (!context) {
        throw new Error('useQuranAuth must be used within a QuranAuthProvider');
    }
    return context;
};

export const QuranAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check for existing session on app load
    useEffect(() => {
        const savedUser = localStorage.getItem('qf_user');
        const savedToken = localStorage.getItem('qf_access_token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setAccessToken(savedToken);
        }
    }, []);

    // Login - Redirect to Quran Foundation
    const login = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Calls: https://echoes-of-jannah.vercel.app/api/auth/login-url
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

    // Handle OAuth callback after redirect
    const handleAuthCallback = useCallback(async (authorizationCode, state) => {
        setIsLoading(true);
        setError(null);
        try {
            // Calls: https://echoes-of-jannah.vercel.app/api/auth/exchange
            const response = await fetch(`${API_BASE_URL}/api/auth/exchange`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: authorizationCode, state }),
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
            
            if (data.refreshToken) {
                localStorage.setItem('qf_refresh_token', data.refreshToken);
            }

            const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
            localStorage.removeItem('qf_redirect_path');
            window.location.href = redirectPath;
        } catch (err) {
            console.error('Callback error:', err);
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('qf_user');
        localStorage.removeItem('qf_access_token');
        localStorage.removeItem('qf_refresh_token');
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
            handleAuthCallback, 
            isAuthenticated: !!user 
        }}>
            {children}
        </QuranAuthContext.Provider>
    );
};
