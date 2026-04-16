import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  // Read from cookies
  const cookies = req.headers.cookie || '';
  const getCookie = (name) => {
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const storedState = getCookie('oauth_state');
  const codeVerifier = getCookie('oauth_code_verifier');
  const expectedNonce = getCookie('oauth_nonce');

  console.log('State from URL:', state);
  console.log('Stored state from cookie:', storedState);

  if (!storedState || !codeVerifier || !expectedNonce) {
    return res.status(400).json({ error: 'Missing session data' });
  }

  if (state !== storedState) {
    return res.status(400).json({ error: 'State mismatch' });
  }

  const CLIENT_ID = process.env.CLIENT_ID || '911c5b21-975f-4610-be81-f7158e7e6047';
  const CLIENT_SECRET = process.env.CLIENT_SECRET || 'oESUyMXqqRSkQP8HBRmATrZlwp';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    const tokenResponse = await axios.post(
      `${AUTH_BASE_URL}/oauth2/token`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: CLIENT_ID, password: CLIENT_SECRET },
      }
    );

    const tokenData = tokenResponse.data;
    const idTokenPayload = JSON.parse(
      Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
    );

    if (idTokenPayload.nonce !== expectedNonce) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // Clear cookies
    res.setHeader('Set-Cookie', [
      'oauth_state=; Path=/; Max-Age=0',
      'oauth_code_verifier=; Path=/; Max-Age=0',
      'oauth_nonce=; Path=/; Max-Age=0'
    ]);

    const user = {
      id: idTokenPayload.sub,
      name: idTokenPayload.name || idTokenPayload.email?.split('@')[0] || 'Quran User',
      email: idTokenPayload.email,
    };

    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      user: user,
    });
  } catch (error) {
    console.error('Exchange failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
