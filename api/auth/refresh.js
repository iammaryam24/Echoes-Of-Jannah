// api/auth/refresh.js
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

  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refresh token' });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

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
      expiresIn: tokenResponse.data.expires_in,
    });
  } catch (error) {
    console.error('[API] Refresh failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Token refresh failed' });
  }
}
