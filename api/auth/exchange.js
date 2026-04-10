// api/auth/exchange.js
<<<<<<< HEAD
// Vercel Serverless Function - Exchanges code for tokens
=======
import axios from 'axios';
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
<<<<<<< HEAD
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
=======
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

<<<<<<< HEAD
  // Only allow POST requests
=======
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

<<<<<<< HEAD
  // Your Quran Foundation credentials
=======
  // ============================================
  // YOUR QURAN FOUNDATION CREDENTIALS (Pre-Production)
  // ============================================
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  const CLIENT_ID = '911c5b21-975f-4610-be81-f7158e7e6047';
  const CLIENT_SECRET = 'oESUyMXqqRSkQP8HBRmATrZlwp';
  const REDIRECT_URI = 'https://echoes-of-jannah.vercel.app/auth/callback';
  const AUTH_BASE_URL = 'https://prelive-oauth2.quran.foundation';

  const { code, state } = req.body;

  if (!code || !state) {
<<<<<<< HEAD
    return res.status(400).json({ error: 'Missing code or state parameter' });
=======
    return res.status(400).json({ error: 'Missing code or state' });
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
  }

  // Retrieve stored PKCE data
  const pkceData = global.__oauthStore?.[state];
  if (!pkceData) {
<<<<<<< HEAD
    return res.status(400).json({ error: 'Invalid or expired state parameter' });
  }

  const { codeVerifier, nonce: expectedNonce } = pkceData;

  // Clean up stored data
  delete global.__oauthStore[state];

  try {
    // Import axios
    const axios = (await import('axios')).default;

=======
    return res.status(400).json({ error: 'Invalid or expired state' });
  }

  const { codeVerifier, nonce: expectedNonce } = pkceData;
  delete global.__oauthStore[state];

  try {
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
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

<<<<<<< HEAD
    const tokenData = tokenResponse.data;

    // Decode ID token to get user information
    const idTokenPayload = JSON.parse(
      Buffer.from(tokenData.id_token.split('.')[1], 'base64').toString()
    );

    // Verify nonce (security)
=======
    // Decode ID token to get user information
    const idTokenPayload = JSON.parse(
      Buffer.from(tokenResponse.data.id_token.split('.')[1], 'base64').toString()
    );

    // Verify nonce (security) - PREVENTS CSRF ATTACKS
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
    if (idTokenPayload.nonce !== expectedNonce) {
      console.error('[API] Nonce mismatch! Possible CSRF attack.');
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    // Extract user information
    const user = {
      id: idTokenPayload.sub,
      name: idTokenPayload.name || idTokenPayload.email?.split('@')[0] || 'Quran User',
      email: idTokenPayload.email,
<<<<<<< HEAD
    };

    console.log(`[API] User ${user.id} logged in successfully`);

    // Return tokens and user info to frontend
    return res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
=======
      picture: idTokenPayload.picture || null,
    };

    console.log(`[API] User ${user.id} authenticated successfully`);

    // Return tokens and user info to frontend
    return res.status(200).json({
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
      expiresIn: tokenResponse.data.expires_in,
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
      user: user,
    });
  } catch (error) {
    console.error('[API] Token exchange failed:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Token exchange failed' });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> f38d7a30ffc880f04e81f554d719df0d0801dc18
