// api/auth/exchange.js
// Vercel Serverless Function - Exchanges code for tokens

import axios from 'axios';  // 👈 ADD THIS LINE AT THE TOP

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Your Quran Foundation credentials
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  // Retrieve stored PKCE data
  const pkceData = global.__oauthStore?.[state];
  if (!pkceData) {
    return res.status(400).json({ error: 'Invalid or expired state parameter' });
  }

  const { codeVerifier, nonce: expectedNonce } = pkceData;

  // Clean up stored data
  delete global.__oauthStore[state];

  try {
    // Prepare token exchange request
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code_verifier', codeVerifier);

    // Exchange code for tokens (Confidential client flow with Basic Auth)
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

    const tokenData = tokenResponse.data;

    // Decode ID token to get user information
    const idTokenPayload = JSON.parse(
      Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
    );

    // Verify nonce (security)
    if (idTokenPayload.nonce !== expectedNonce) {
      console.error('[API] Nonce mismatch! Possible CSRF attack.');
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // Extract user information
    const user = {
      id: idTokenPayload.sub,
      name: idTokenPayload.name || idTokenPayload.email?.split('@')[0] || 'Quran User',
      email: idTokenPayload.email,
    };

    console.log(`[API] User ${user.id} logged in successfully`);

    // Return tokens and user info to frontend
    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user: user,
    });
  } catch (error) {
    console.error('[API] Token exchange failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}
