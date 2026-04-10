import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state: searchParams.get('state') }),
        });

        const data = await response.json();
        
        // Store both tokens AND user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user)); // ← PROOF you used their API
        
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  if (error) return <div>Error: {error}</div>;
  return <div>Completing sign in...</div>;
}
