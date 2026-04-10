export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(process.env.QF_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.QF_REDIRECT_URI,
        client_id: process.env.QF_CLIENT_ID,
        client_secret: process.env.QF_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    
    // ✅ CRITICAL: Fetch user info to prove API usage
    const userResponse = await fetch(process.env.QF_USERINFO_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    return res.status(200).json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      user: userData  // This proves you're using their API
    });
  } catch (error) {
    console.error('Exchange error:', error);
    return res.status(500).json({ error: error.message });
  }
}
