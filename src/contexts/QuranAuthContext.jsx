// src/contexts/QuranAuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

// Empty string means use same domain (Vercel serverless functions)
// For local development, you can set this to 'http://localhost:3001'
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
    const [refreshToken, setRefreshToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const refreshTimeoutRef = useRef(null);

    // Check for existing session on app load
    useEffect(() => {
        const savedUser = localStorage.getItem('qf_user');
        const savedToken = localStorage.getItem('qf_access_token');
        const savedRefreshToken = localStorage.getItem('qf_refresh_token');
        
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setAccessToken(savedToken);
            if (savedRefreshToken) setRefreshToken(savedRefreshToken);
            
            // Schedule token refresh if needed
            scheduleTokenRefresh();
        }
    }, []);

    // Schedule automatic token refresh before expiry
    const scheduleTokenRefresh = useCallback(() => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        
        // Refresh 5 minutes before expiry (tokens expire in 3600 seconds)
        refreshTimeoutRef.current = setTimeout(() => {
            refreshAccessToken();
        }, 55 * 60 * 1000); // 55 minutes
    }, []);

    // Refresh access token using refresh token
    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setAccessToken(data.accessToken);
                localStorage.setItem('qf_access_token', data.accessToken);
                scheduleTokenRefresh();
            }
        } catch (err) {
            console.error('Token refresh failed:', err);
            // If refresh fails, logout user
            logout();
        }
    }, [refreshToken, scheduleTokenRefresh]);

    // Login - Redirect to Quran Foundation
    const login = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Calls: https://echoes-of-jannah.vercel.app/api/auth/login-url
            const response = await fetch(`${API_BASE_URL}/api/auth/login-url`);
            if (!response.ok) throw new Error('Failed to get login URL');
            const { url } = await response.json();
            
            // Save current path to redirect back after login
            localStorage.setItem('qf_redirect_path', window.location.pathname);
            
            // Redirect to Quran Foundation login page
            window.location.href = url;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            setIsLoading(false);
        }
    }, []);

    // Handle OAuth callback after redirect from Quran Foundation
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
            
            // Save user and tokens
            setUser(data.user);
            setAccessToken(data.accessToken);
            if (data.refreshToken) {
                setRefreshToken(data.refreshToken);
                localStorage.setItem('qf_refresh_token', data.refreshToken);
            }
            
            localStorage.setItem('qf_user', JSON.stringify(data.user));
            localStorage.setItem('qf_access_token', data.accessToken);
            
            // Schedule token refresh
            scheduleTokenRefresh();

            // Redirect to original page or home
            const redirectPath = localStorage.getItem('qf_redirect_path') || '/';
            localStorage.removeItem('qf_redirect_path');
            window.location.href = redirectPath;
        } catch (err) {
            console.error('Callback error:', err);
            setError(err.message);
            setIsLoading(false);
        }
    }, [scheduleTokenRefresh]);

    // Logout - Clear all session data
    const logout = useCallback(async () => {
        // Clear token refresh timeout
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
        
        // Clear all state
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        setError(null);
        setIsLoading(false);
        
        // Clear localStorage
        localStorage.removeItem('qf_user');
        localStorage.removeItem('qf_access_token');
        localStorage.removeItem('qf_refresh_token');
        localStorage.removeItem('qf_redirect_path');
        
        // Redirect to home page
        window.location.href = '/';
    }, []);

    // Get auth headers for API calls
    const getAuthHeaders = useCallback(() => {
        if (!accessToken) return {};
        return {
            'x-auth-token': accessToken,
            'x-client-id': '911c5b21-975f-4610-be81-f7158e7e6047', // Your client ID
        };
    }, [accessToken]);

    // Make authenticated API call
    const authenticatedFetch = useCallback(async (url, options = {}) => {
        if (!accessToken) {
            throw new Error('Not authenticated');
        }
        
        const headers = {
            ...options.headers,
            ...getAuthHeaders(),
        };
        
        const response = await fetch(url, { ...options, headers });
        
        // If unauthorized, try to refresh token
        if (response.status === 401) {
            await refreshAccessToken();
            // Retry with new token
            const newHeaders = {
                ...options.headers,
                ...getAuthHeaders(),
            };
            return fetch(url, { ...options, headers: newHeaders });
        }
        
        return response;
    }, [accessToken, getAuthHeaders, refreshAccessToken]);

    const value = {
        // State
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,
        isAuthenticated: !!user && !!accessToken,
        
        // Methods
        login,
        logout,
        handleAuthCallback,
        refreshAccessToken,
        getAuthHeaders,
        authenticatedFetch,
    };

    return (
        <QuranAuthContext.Provider value={value}>
            {children}
        </QuranAuthContext.Provider>
    );
};
