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

  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  // Generate PKCE values
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');

  // Store in memory (Vercel keeps it for this function instance)
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

  const authUrl = `${AUTH_BASE_URL}/oauth2/auth?` + new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'openid offline_access',
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log(`[LOGIN] Generated URL for state: ${state.substring(0, 8)}`);
  return res.status(200).json({ url: authUrl });
}
