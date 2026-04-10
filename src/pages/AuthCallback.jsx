import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuranAuth } from '../contexts/QuranAuthContext';

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthCallback } = useQuranAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleAuthCallback(code, state);
    } else {
      navigate('/');
    }
  }, [location, handleAuthCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-4xl mb-4 animate-spin">🕋</div>
        <p>Signing you in...</p>
      </div>
    </div>
  );
}
