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

  const { code, state, codeVerifier } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // These will come from Vercel Environment Variables
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const AUTH_BASE_URL = process.env.AUTH_BASE_URL || 'https://prelive-oauth2.quran.foundation';

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const tokenResponse = await axios.post(
      `${AUTH_BASE_URL}/oauth2/token`,
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET,
        },
      }
    );

    return res.status(200).json({
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
    });
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
