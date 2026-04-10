// src/contexts/QuranAuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001';
// Empty string means use same domain (Vercel serverless functions)
const API_BASE_URL = '';

const QuranAuthContext = createContext();

@@ -18,6 +20,7 @@ export const QuranAuthProvider = ({ children }) => {
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

    // Check for existing session on app load
useEffect(() => {
const savedUser = localStorage.getItem('qf_user');
const savedToken = localStorage.getItem('qf_access_token');
@@ -27,10 +30,12 @@ export const QuranAuthProvider = ({ children }) => {
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
@@ -43,10 +48,12 @@ export const QuranAuthProvider = ({ children }) => {
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
@@ -79,19 +86,13 @@ export const QuranAuthProvider = ({ children }) => {
}
}, []);

    // Logout
const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        }
        
setUser(null);
setAccessToken(null);
localStorage.removeItem('qf_user');
localStorage.removeItem('qf_access_token');
localStorage.removeItem('qf_refresh_token');
        
window.location.href = '/';
}, []);

@@ -109,4 +110,4 @@ export const QuranAuthProvider = ({ children }) => {
{children}
</QuranAuthContext.Provider>
);
};
};
