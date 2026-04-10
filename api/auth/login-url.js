// api/auth/login-url.js
import crypto from 'crypto';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Your Quran Foundation credentials - HARDCODED (not undefined)
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';
  const SCOPES = 'openid offline_access';

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

  // Generate PKCE values
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = randomString(16);
  const nonce = randomString(16);

  // Store PKCE data
  if (!global.__oauthStore) {
    global.__oauthStore = {};
  }
  global.__oauthStore[state] = { codeVerifier, nonce, createdAt: Date.now() };

  // Clean up old entries
  Object.keys(global.__oauthStore).forEach(key => {
    if (global.__oauthStore[key]?.createdAt < Date.now() - 5 * 60 * 1000) {
      delete global.__oauthStore[key];
    }
  });

  // Build the authorization URL - USING HARDCODED VALUES
  const authUrl = `${AUTH_BASE_URL}/oauth2/auth?` + new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log(`[API] Generated login URL`);
  
  return res.status(200).json({ url: authUrl });
}
