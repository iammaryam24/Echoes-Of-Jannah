// src/components/SignInButton.jsx
import React, { useState } from 'react';

const SignInButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      // Step 2: Get OAuth URL from serverless function
      const response = await fetch('/api/auth/login-url');
      const data = await response.json();
      
      // Step 4: Redirect to Quran Foundation login page
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to get login URL:', error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSignIn} 
      disabled={loading}
      className="signin-button"
    >
      {loading ? 'Loading...' : 'Sign In with Quran Foundation'}
    </button>
  );
};

export default SignInButton;
