// api/auth/login-url.js
<<<<<<< HEAD
// Vercel Serverless Function - Generates OAuth Login URL
=======
import crypto from 'crypto';
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
<<<<<<< HEAD
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
=======
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

<<<<<<< HEAD
  // Your Quran Foundation credentials
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';
=======
  // ============================================
  // YOUR QURAN FOUNDATION CREDENTIALS (Pre-Production)
  // ============================================
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';
  const SCOPES = 'openid offline_access user collection bookmark reading_session preference goal streak';
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18

  // PKCE helper functions
  function generatePkcePair() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge };
  }

  function randomString(bytes = 16) {
    return crypto.randomBytes(bytes).toString('hex');
  }

<<<<<<< HEAD
  // Import crypto (Node.js built-in)
  const crypto = await import('crypto');

  // Generate PKCE values
=======
  // Generate PKCE values - ONLY ONCE
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = randomString(16);
  const nonce = randomString(16);

<<<<<<< HEAD
  // Store PKCE data in global memory (for serverless, persists across requests)
  if (!global.__oauthStore) {
    global.__oauthStore = {};
  }
  global.__oauthStore[state] = { codeVerifier, nonce, createdAt: Date.now() };

=======
  // Store PKCE data in memory
  if (!global.__oauthStore) {
    global.__oauthStore = {};
  }
  
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  // Clean up old entries (older than 5 minutes)
  Object.keys(global.__oauthStore).forEach(key => {
    if (global.__oauthStore[key]?.createdAt < Date.now() - 5 * 60 * 1000) {
      delete global.__oauthStore[key];
    }
  });
<<<<<<< HEAD
=======
  
  global.__oauthStore[state] = { codeVerifier, nonce, createdAt: Date.now() };
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18

  // Build the authorization URL
  const authUrl = `${AUTH_BASE_URL}/oauth2/auth?` + new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
<<<<<<< HEAD
    scope: 'openid offline_access',
=======
    scope: SCOPES,
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log(`[API] Generated login URL for state: ${state.substring(0, 8)}`);
<<<<<<< HEAD
  
  return res.status(200).json({ url: authUrl });
}
=======
  return res.status(200).json({ url: authUrl });
}
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
