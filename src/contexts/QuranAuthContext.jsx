// src/pages/AuthCallback.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuranAuth } from '../contexts/QuranAuthContext';

export default function AuthCallback() {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleAuthCallback, isLoading, error } = useQuranAuth();
    const [status, setStatus] = useState('Connecting to Quran Foundation...');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        if (errorParam) {
            setStatus(`❌ Authentication failed`);
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        if (!code || !state) {
            setStatus('❌ Invalid callback');
            setTimeout(() => navigate('/'), 3000);
            return;
        }

        setStatus('🔐 Authenticating...');
        handleAuthCallback(code, state);
    }, [location, handleAuthCallback, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-400 mb-2">Login Failed</h2>
                    <p className="text-gray-300 text-sm">{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-5 py-2 bg-amber-600 rounded-xl">Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4 animate-pulse">🕋</div>
                <p className="text-white text-lg">{status}</p>
                {isLoading && <div className="mt-4 w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />}
            </div>
        </div>
    );
}
