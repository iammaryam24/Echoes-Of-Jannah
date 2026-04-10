import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');

  if (!global.__oauthStore) global.__oauthStore = {};
  global.__oauthStore[state] = { codeVerifier, nonce, createdAt: Date.now() };

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

  return res.status(200).json({ url: authUrl });
}
