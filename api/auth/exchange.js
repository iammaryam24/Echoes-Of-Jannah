import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  const { code, state } = req.body;

  if (!code || !state) return res.status(400).json({ error: 'Missing code or state' });

  const pkceData = global.__oauthStore?.[state];
  if (!pkceData) return res.status(400).json({ error: 'Invalid state' });

  const { codeVerifier } = pkceData;
  delete global.__oauthStore[state];

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    const tokenResponse = await axios.post(`${AUTH_BASE_URL}/oauth2/token`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: CLIENT_ID, password: CLIENT_SECRET },
    });

    const idTokenPayload = JSON.parse(Buffer.from(tokenResponse.data.id_token.split('.')[1], 'base64').toString());

    return res.status(200).json({
      accessToken: tokenResponse.data.access_token,
      user: { id: idTokenPayload.sub, name: idTokenPayload.name || 'User', email: idTokenPayload.email }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
